const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, index: true }, // Links appointment to authenticated user
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorHospital: { type: String },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  patientEmail: { type: String },
  date: { type: String, required: true },
  slot: { type: String, required: true },
  symptoms: { type: String },
  fee: { type: Number, default: 500 },
  status: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed'], default: 'Confirmed' },
  adminNotes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
