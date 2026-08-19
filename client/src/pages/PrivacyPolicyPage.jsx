import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Lock, Eye, FileText, Share2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#152420] to-[#1e352f] text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-500/30 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Security & Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-3 leading-relaxed">
            Your trust matters. Here's how we protect your data. At Ayurveda Arogya, your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, and safeguard your personal information.
          </p>
        </div>
      </div>

      {/* Main Policy Content */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-10">
        
        {/* Information Collection */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#152420]">Information Collection</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-13">
            We collect personal details such as your name, email address, phone number, and shipping information during consultations, purchases, or newsletter signups. This data helps us improve your experience and provide tailored services.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Use of Information */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#152420]">Use of Information</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-13">
            Your information is used for order fulfillment, communication, personalized consultation, service improvement, and sending updates or wellness tips.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Data Protection */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#152420]">Data Protection</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-13">
            We implement industry-standard encryption, secure servers, and restricted data access protocols to keep your data safe from unauthorized access or misuse.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Third-Party Sharing */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#152420]">Third-Party Sharing</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-13">
            We do not sell or trade your data. We only share it with trusted third parties for services like payments and delivery, and always under confidentiality agreements.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Policy Updates */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#152420]">Policy Updates</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-13">
            We may update this policy to reflect changes in our practices. The revised policy will be posted here with a revised effective date.
          </p>
        </section>

        {/* Contact Support Box */}
        <div className="bg-[#152420] text-white rounded-2xl p-6 sm:p-8 mt-8 space-y-4">
          <h3 className="text-lg font-bold text-emerald-400">Have Questions?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-200">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Email</span>
                <a href="mailto:info@ayurvedarogya.com" className="hover:text-emerald-300 underline transition">
                  info@ayurvedarogya.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Phone / WhatsApp</span>
                <span>+91-8171117711</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Address</span>
                <span>Ayurveda Arogya, 82/3, First Floor, Patel Nagar, Saharanpur Road, Dehradun, Uttarakhand, 248001</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
