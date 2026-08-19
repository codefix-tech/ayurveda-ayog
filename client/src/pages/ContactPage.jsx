import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useCart();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim() && message.trim()) {
      setSubmitted(true);
      showToast('Thank you! Your message has been sent to Ayurveda Arogya care team.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-10 font-sans">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Help & Store Locator
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#152420] mt-3">
          Contact Us & Store Locations
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Have questions about your order, dosage guidelines, or need assistance? Reach out to our customer care team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#152420] text-white p-8 rounded-3xl space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-emerald-400">Headquarters & Store</h2>

            <div className="space-y-4 text-xs text-gray-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">Main Pharmacy Store</h3>
                  <p className="mt-0.5 text-gray-300">Ayurveda Arogya, 82/3, First Floor, Patel Nagar, Saharanpur Road, Dehradun, Uttarakhand, 248001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">Phone / WhatsApp</h3>
                  <p className="mt-0.5 text-gray-300">+91-8171117711</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">Email Enquiries</h3>
                  <p className="mt-0.5 text-gray-300">info@ayurvedarogya.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">Working Hours</h3>
                  <p className="mt-0.5 text-gray-300">Monday - Saturday: 9:00 AM – 8:00 PM</p>
                  <p className="text-gray-400 text-[11px]">Sunday: 10:00 AM – 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-800">Message Received!</h2>
              <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
                Thank you for contacting Ayurveda Arogya. Our team will get back to you within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-[#152420] text-white text-xs font-bold px-6 py-2.5 rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-black text-[#152420] mb-4">Send Us a Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Query / Feedback *</label>
                <textarea
                  rows="4"
                  placeholder="How can we assist you with medicines, doctor appointments, or orders?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#152420] hover:bg-[#1b2f28] text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Enquiry
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
