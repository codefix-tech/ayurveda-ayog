import React, { useEffect, useState } from 'react';
import { fetchDoctors, bookAppointment } from '../services/api';
import { Calendar, Clock, Stethoscope, User, Phone, Mail, CheckCircle2, Award, Building } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const { showToast } = useCart();

  // Form fields
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [symptoms, setSymptoms] = useState('');

  useEffect(() => {
    async function loadDocs() {
      try {
        setLoading(true);
        const res = await fetchDoctors();
        if (res.doctors) {
          setDoctors(res.doctors);
          if (res.doctors.length > 0) {
            setSelectedDoctor(res.doctors[0]);
            setSelectedSlot(res.doctors[0].slots[0]);
          }
        }
      } catch (err) {
        console.error('Failed loading doctors:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDocs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot || !patientName || !patientPhone) {
      showToast('Please fill in all required appointment fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookAppointment({
        doctorId: selectedDoctor.id,
        patientName,
        patientPhone,
        patientEmail,
        date: selectedDate,
        slot: selectedSlot,
        symptoms
      });

      if (res && res.success) {
        setBookingResult(res.appointment);
        showToast('Appointment booked successfully!');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        showToast(res?.message || 'Failed to book appointment. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Booking error:', err);
      showToast('Error booking appointment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-10 font-sans">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-1.5 rounded-full text-xs font-bold mb-3">
          <Stethoscope className="w-4 h-4" />
          Certified BAMS Vaidya Consultation
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#152420]">
          Book an Online Doctor Appointment
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
          Consult India's leading Ayurvedic doctors from the comfort of your home. Get personalized remedy plans, prakriti analysis, and lifestyle guidance.
        </p>
      </div>

      {bookingResult ? (
        /* Confirmation Screen */
        <div className="max-w-2xl mx-auto bg-white border border-emerald-200 rounded-3xl p-8 sm:p-12 shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-700" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Booking Confirmed
          </span>
          <h2 className="text-2xl font-black text-[#152420] mt-3">
            Appointment ID: {bookingResult.id}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            A confirmation SMS & Email has been sent to {bookingResult.patientPhone}.
          </p>

          <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-bold">Consulting Vaidya:</span>
              <span className="font-bold text-gray-900">{bookingResult.doctorName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-bold">Scheduled Date & Time:</span>
              <span className="font-bold text-gray-900">{bookingResult.date} at {bookingResult.slot}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-bold">Patient Name:</span>
              <span className="font-bold text-gray-900">{bookingResult.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-bold">Consultation Fee:</span>
              <span className="font-bold text-emerald-800 text-sm">₹{bookingResult.fee}.00</span>
            </div>
          </div>

          <button
            onClick={() => { setBookingResult(null); }}
            className="mt-8 bg-[#152420] text-white text-xs font-bold px-8 py-3.5 rounded-xl shadow hover:bg-emerald-900 transition"
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
        /* Doctor Picker & Form Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Doctor Listings (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-800 mb-3">
              Select Ayurvedic Specialist
            </h2>

            {loading ? (
              <div className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
            ) : (
              doctors.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    if (doc.slots.length > 0) setSelectedSlot(doc.slots[0]);
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex gap-4 ${
                    selectedDoctor?.id === doc.id
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
                  }`}
                >
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shrink-0"
                    onError={(e) => { e.target.src = '/assets/l2cfjrmzmass6l2zhmal.webp'; }}
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-[#152420] text-sm sm:text-base">
                        {doc.name}
                      </h3>
                      <span className="text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        ₹{doc.fee}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{doc.qualification}</p>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{doc.specialization}</p>

                    <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-600">
                      <span className="flex items-center gap-1 font-bold">
                        <Award className="w-3 h-3 text-emerald-700" /> {doc.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-gray-400" /> {doc.hospital.split(',')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Date, Slot & Patient Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-[#152420] mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              Schedule & Patient Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Date & Slot selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Consultation Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Time Slot *
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#152420]"
                    required
                  >
                    {selectedDoctor?.slots.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Sharma"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#152420]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#152420]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="patient@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#152420]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Health Concerns / Symptoms
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Briefly describe your symptoms (e.g., chronic hyperacidity, joint stiffness, skin rash)..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#152420]"
                  ></textarea>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#152420] hover:bg-[#1b2f28] text-white text-sm font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                {submitting ? 'Booking Consultation...' : `Confirm & Book Appointment (₹${selectedDoctor?.fee || 500})`}
              </button>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}
