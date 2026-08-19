import React from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, Clock, Truck, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReturnPolicyPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#152420] to-[#1e352f] text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-500/30 mb-4">
            <RotateCcw className="w-3.5 h-3.5" /> Customer Assurance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Return, Refund & Cancellation Policy</h1>
          <p className="text-emerald-100 text-xs sm:text-sm font-semibold mt-2">
            Transparent, Ethical & Customer-Centric
          </p>
          <p className="text-gray-300 text-xs mt-3">
            Last updated: 28-07-2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-10">
        
        <p className="text-sm text-gray-600 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          We want you to have complete confidence when buying Ayurvedic products from us. This policy explains when and how you can request a return, refund, or replacement, and the conditions that apply.
        </p>

        {/* General Eligibility */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#152420] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> General Eligibility
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 pl-4 border-l-2 border-emerald-500">
            <li>• The item was delivered expired, leaked or incorrect.</li>
            <li>• You received a different product/variant than what you ordered.</li>
            <li>• <strong>Time window to raise a request:</strong> within 24 to 48 hours of delivery.</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* Non-Returnable Items */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#152420] flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> Non-Returnable / Non-Refundable Items
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-200">Opened, used, or partially consumed products.</li>
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-200">Broken seals or missing packaging.</li>
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-200">Cold-chain products in good condition.</li>
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-200">Personal care/hygiene items, custom or trial packs, free gifts.</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* Damaged / Leaked */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#152420]">Damaged, Leaked, or Missing Items</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Please notify us within 24 hours of delivery with clear photos/videos.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Return & Refund Process */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#152420] flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-600" /> Return & Refund Process
          </h2>
          <ol className="space-y-3 text-xs sm:text-sm text-gray-600">
            <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#152420] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <span>Raise a request via email/WhatsApp with order details and photos.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#152420] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <span>We assess the claim for eligibility.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#152420] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
              <span>Pick-up arranged or return address shared.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#152420] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">4</span>
              <span>QC check before final approval.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#152420] text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">5</span>
              <span>Refund or replacement processed in 5–7 business days.</span>
            </li>
          </ol>
        </section>

        <hr className="border-gray-100" />

        {/* Cancellations & Shipping */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#152420] flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-emerald-600" /> Cancellations & Shipping
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Orders can be canceled before dispatch. Shipping cost borne by us in case of our error.
          </p>
        </section>

        {/* Need Help CTA */}
        <div className="bg-[#152420] text-white rounded-2xl p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-emerald-400">Need Assistance with a Return?</h3>
          <p className="text-xs text-gray-300">
            Contact our dedicated support team via email or WhatsApp for quick resolution.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <a href="mailto:info@ayurvedarogya.com" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition flex items-center gap-2">
              <Mail className="w-4 h-4" /> info@ayurvedarogya.com
            </a>
            <span className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" /> +91-8171117711
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
