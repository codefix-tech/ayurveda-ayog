import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin, AlertCircle, FileText, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShippingPolicyPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#152420] to-[#1e352f] text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-500/30 mb-4">
            <Truck className="w-3.5 h-3.5" /> Doorstep Delivery Across India
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Shipping Policy</h1>
          <p className="text-emerald-100 text-xs sm:text-sm font-semibold mt-2">
            Reliable Delivery for Authentic Ayurvedic Products
          </p>
          <p className="text-gray-300 text-xs mt-3">
            Last updated: 28-07-2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-10">
        
        {/* Order Processing & Dispatch */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#152420]">Order Processing & Dispatch</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-13">
            At Ayurveda Arogya, we take great care to ensure that your products reach you on time and in perfect condition. Orders are usually processed within 1–2 business days of confirmation.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 pl-13">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
              <span>Orders placed before 2:00 PM IST are processed on the same day whenever possible.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
              <span>Orders placed on Sundays or public holidays will be processed the next working day.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
              <span>You will receive an email or SMS notification once your order has been dispatched.</span>
            </li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* Delivery Timelines */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#152420]">Delivery Timelines</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-13">
            Delivery time varies depending on your location and courier partner availability. Typical delivery timelines are as follows:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-13 pt-2">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <span className="text-emerald-700 font-bold text-xs uppercase block">Metro Cities</span>
              <span className="text-lg font-black text-[#152420]">2–5 business days</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <span className="text-emerald-700 font-bold text-xs uppercase block">Non-Metro Areas</span>
              <span className="text-lg font-black text-[#152420]">5–7 business days</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <span className="text-emerald-700 font-bold text-xs uppercase block">Remote / Rural Regions</span>
              <span className="text-lg font-black text-[#152420]">7–10 business days</span>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Shipping Charges */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#152420]">Shipping Charges</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We strive to keep shipping costs minimal. Shipping charges, if applicable, will be displayed at checkout before payment confirmation. Free shipping may apply to orders above a specific amount, as mentioned on the website. Shipping charges are non-refundable unless the return is due to our error.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Order Tracking & International Shipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-[#152420] text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Order Tracking
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Once your order is shipped, you will receive tracking details via email or SMS. You can track your shipment on the courier partner’s website using the provided tracking ID.
            </p>
          </div>

          <div className="space-y-2 bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-[#152420] text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" /> International Shipping
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Currently, we only deliver orders within India. International orders are not supported at this time.
            </p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Delayed / Undelivered & Address Accuracy */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#152420]">Delayed, Undelivered or Damaged Orders</h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              In rare cases, delays may occur due to weather conditions, courier network issues, or incorrect address details. We will notify you of any delay and work with the courier to resolve it quickly. If your order hasn’t arrived within the expected time, please contact our support team via our <Link to="/contact" className="text-emerald-700 underline font-semibold">Contact Us</Link> page with your order details.
            </p>
            <p>
              <strong>Address Accuracy:</strong> Please ensure your shipping address and contact information are accurate before confirming your order. We are not responsible for orders delayed or undelivered due to incorrect or incomplete address details.
            </p>
            <p>
              <strong>Damage During Transit:</strong> In the unlikely event of a damaged or leaked product, please contact us within 24 hours of delivery with clear photos and order details. For detailed return guidelines, refer to our <Link to="/return-policy" className="text-emerald-700 underline font-semibold">Return & Refund Policy</Link>.
            </p>
          </div>
        </section>

      </div>

    </div>
  );
}
