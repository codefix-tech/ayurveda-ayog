const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/dbManager');
const Appointment = require('../models/Appointment');
const { getMongoStatus } = require('../config/db');
const { protect, optionalAuth, admin } = require('../middleware/auth');
const { sendAppointmentConfirmation } = require('../utils/emailService');

// Helper: generate collision-resistant appointment ID
function generateAppointmentId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `APT-${timestamp}-${random}`;
}

// GET list of all doctors
router.get('/doctors', (req, res) => {
  res.json({
    success: true,
    doctors: db.getDoctors()
  });
});

// GET doctor by ID
router.get('/doctors/:id', (req, res) => {
  const doctors = db.getDoctors();
  const doc = doctors.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }
  res.json({ success: true, doctor: doc });
});

// POST book new appointment & persist in database (Supports guest & logged-in users)
router.post('/appointments', optionalAuth, async (req, res) => {
  const { doctorId, patientName, patientPhone, patientEmail, date, slot, symptoms } = req.body;

  if (!doctorId || !patientName || !patientPhone || !date || !slot) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required appointment fields.'
    });
  }

  // Basic input validation
  if (patientName.length > 100) {
    return res.status(400).json({ success: false, message: 'Patient name too long (max 100 chars).' });
  }
  if (patientPhone.length > 20) {
    return res.status(400).json({ success: false, message: 'Phone number too long.' });
  }

  // Validate date (YYYY-MM-DD) is not in the past
  const todayStr = new Date().toISOString().split('T')[0];
  if (date < todayStr) {
    return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past.' });
  }

  const doctors = db.getDoctors();
  const doc = doctors.find(d => d.id === doctorId);

  const appointmentData = {
    id: generateAppointmentId(),
    userId: req.user ? (req.user._id || req.user.id) : null, // Link appointment to user if logged in
    doctorId,
    doctorName: doc ? doc.name : 'Ayurvedic Specialist',
    doctorHospital: doc ? doc.hospital : 'Ayurveda Arogya Center',
    patientName: patientName.trim().substring(0, 100),
    patientPhone: patientPhone.trim().substring(0, 20),
    patientEmail: (patientEmail || '').trim().substring(0, 100),
    date,
    slot: slot.substring(0, 20),
    symptoms: (symptoms || '').substring(0, 500),
    fee: doc ? doc.fee : 500,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  try {
    if (getMongoStatus()) {
      const docAppt = new Appointment(appointmentData);
      await docAppt.save();
    }
  } catch (mongoErr) {
    console.error('Mongo save error, falling back to JSON db:', mongoErr.message);
  }

  // Always persist to dbManager file store
  db.saveAppointment(appointmentData);

  // Send confirmation email to patient (non-blocking — won't fail the booking)
  sendAppointmentConfirmation(appointmentData).catch((err) =>
    console.error('Appointment confirmation email error:', err.message)
  );

  res.status(201).json({
    success: true,
    message: 'Appointment booked & saved to database successfully!',
    appointment: appointmentData
  });
});

// GET current user's appointments (Protected)
router.get('/appointments/my', protect, async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (getMongoStatus()) {
      const appts = await Appointment.find({ userId }).sort({ createdAt: -1 });
      if (appts.length > 0) {
        return res.json({ success: true, count: appts.length, appointments: appts });
      }
    }
  } catch (err) {
    console.error('Mongo user appointments fetch error:', err.message);
  }

  const allAppts = db.getAppointments();
  const userAppts = allAppts.filter(a => a.userId === userId);
  res.json({ success: true, count: userAppts.length, appointments: userAppts });
});

// GET all appointments from database (Admin only)
router.get('/appointments', protect, admin, async (req, res) => {
  try {
    if (getMongoStatus()) {
      const appts = await Appointment.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: appts.length, appointments: appts });
    }
  } catch (err) {
    console.error('Mongo all appointments fetch error:', err.message);
    // Fallback
  }

  const appointments = db.getAppointments();
  res.json({
    success: true,
    count: appointments.length,
    appointments
  });
});

// PUT update appointment status (Admin only)
router.put('/appointments/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'status is required' });

  // Validate status value
  const validStatuses = ['Confirmed', 'Cancelled', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    if (getMongoStatus()) {
      const appointment = await Appointment.findOneAndUpdate(
        { id: req.params.id },
        { status },
        { new: true }
      );
      if (appointment) return res.json({ success: true, appointment });
    }
  } catch (err) {
    console.error('Mongo appointment status update error:', err.message);
  }

  // File fallback update
  const updatedAppointment = db.updateAppointmentStatus(req.params.id, status);
  if (!updatedAppointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  res.json({ success: true, appointment: updatedAppointment });
});

// PUT update appointment consultation notes (Admin only)
router.put('/appointments/:id/notes', protect, admin, async (req, res) => {
  const { adminNotes } = req.body;
  const notesText = (adminNotes || '').trim().substring(0, 2000);

  let updatedAppt = null;

  try {
    if (getMongoStatus()) {
      updatedAppt = await Appointment.findOneAndUpdate(
        { id: req.params.id },
        { adminNotes: notesText },
        { new: true }
      );
    }
  } catch (err) {
    console.error('Mongo appointment notes update error:', err.message);
  }

  // File fallback update
  const fileUpdated = db.updateAppointmentNotes(req.params.id, notesText);
  if (!updatedAppt && fileUpdated) {
    updatedAppt = fileUpdated;
  }

  if (!updatedAppt) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  res.json({ success: true, message: 'Appointment notes updated', appointment: updatedAppt });
});

module.exports = router;
