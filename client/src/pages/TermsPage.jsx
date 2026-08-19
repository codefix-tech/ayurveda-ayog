import React from 'react';
import { FileText, Scale, ShieldCheck, CreditCard, Truck, RotateCcw, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#152420] to-[#1e352f] text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-500/30 mb-4">
            <Scale className="w-3.5 h-3.5" /> Legal Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms & Conditions</h1>
          <p className="text-emerald-100 text-xs sm:text-sm font-semibold mt-2">
            Please read these terms carefully before using our website
          </p>
          <p className="text-gray-300 text-xs mt-3">
            Last updated: 28-07-2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Overview */}
        <section className="space-y-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
          <h2 className="text-lg font-bold text-[#152420]">Overview</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Welcome to Ayurveda Arogya. By accessing our website, making a purchase, or using our services, you agree to be bound by these Terms & Conditions. If you disagree with any part of these terms, please do not use our website.
          </p>
        </section>

        {/* 1. Use of Website */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">1. Use of Website</h2>
          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 pl-5 list-disc">
            <li>You must be at least 18 years old to make purchases from our website.</li>
            <li>All information you provide must be accurate and complete.</li>
            <li>Unauthorized use or access to our website may give rise to legal action.</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* 2. Product Information */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">2. Product Information</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            We strive to ensure that product details, images, and prices are accurate. However, minor variations in color, packaging, or appearance may occur. Ayurveda Arogya reserves the right to modify or discontinue products at any time without notice.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* 3. Pricing & Payments */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">3. Pricing & Payments</h2>
          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 pl-5 list-disc">
            <li>All prices are displayed in INR and are inclusive of applicable taxes.</li>
            <li>Payments must be made via our secure payment partners such as Razorpay.</li>
            <li>We reserve the right to cancel any order in case of pricing errors or payment issues.</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* 4. Shipping & Delivery */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">4. Shipping & Delivery</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Shipping timelines vary depending on your location and product availability. For detailed information, please refer to our <Link to="/shipping-policy" className="text-emerald-700 font-semibold underline">Shipping Policy</Link>.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* 5. Returns, Refunds & Cancellations */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">5. Returns, Refunds & Cancellations</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Our policies are designed for customer satisfaction while maintaining hygiene and safety standards. You can read our detailed policy at <Link to="/return-policy" className="text-emerald-700 font-semibold underline">Return & Refund Policy</Link>.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* 6. Intellectual Property */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">6. Intellectual Property</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            All website content—including text, images, logos, graphics, and code—is the property of Ayurveda Arogya and protected by copyright laws. Unauthorized use or reproduction is strictly prohibited.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* 7. Limitation of Liability */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">7. Limitation of Liability</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Ayurveda Arogya is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Always consult a certified medical practitioner before using any Ayurvedic formulation.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* 8. Governing Law */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">8. Governing Law</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Delhi, India.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* 9. Updates to These Terms */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[#152420]">9. Updates to These Terms</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Ayurveda Arogya reserves the right to modify or update these Terms & Conditions at any time. Changes will be effective immediately upon posting on this page.
          </p>
        </section>

      </div>

    </div>
  );
}
