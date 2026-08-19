import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useCart();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for subscribing to Ayurveda Arogya newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#152420] text-white pt-16 pb-8 mt-20 font-sans border-t-4 border-emerald-600">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Col 1: Brand & Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌿</span>
              <span className="text-2xl font-black tracking-tight text-white">
                Ayurveda Arogya
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Your trusted pan-India Ayurvedic online pharmacy & holistic healthcare platform. Authentic churnas, tablets, oils, and Vaidya consultation.
            </p>

            <div className="space-y-2 text-xs text-gray-300 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ayurveda Arogya, 82/3, First Floor, Patel Nagar, Saharanpur Road, Dehradun, Uttarakhand, 248001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Phone/WhatsApp: +91-8171117711</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Email: info@ayurvedarogya.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/" className="hover:text-white hover:underline transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-white hover:underline transition">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-white hover:underline transition">Shop Medicines</Link></li>
              <li><Link to="/book-appointment" className="hover:text-white hover:underline transition">Book Doctor Consultation</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:underline transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Support Policies */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Support & Policies
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/about" className="hover:text-white hover:underline transition">About Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white hover:underline transition">Privacy Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-white hover:underline transition">Return & Refund Policy</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white hover:underline transition">Shipping Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-white hover:underline transition">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter Subscription */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Subscribe & Save
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Join 50,000+ wellness subscribers to receive weekly health tips and exclusive discount vouchers.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-emerald-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl font-bold transition shadow-md"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe & Secure E-Commerce Checkout</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex justify-center items-center text-xs text-gray-400 text-center">
          <p className="flex items-center justify-center gap-1">
            © 2026 Ayurveda Arogya. Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for authentic natural healing.
          </p>
        </div>

      </div>
    </footer>
  );
}
