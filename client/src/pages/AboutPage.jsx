import React from 'react';
import { Heart, Award, ShieldCheck, CheckCircle2, Users, Sparkles, Stethoscope, Compass, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-gray-800">
      
      {/* Header Hero Section */}
      <div className="bg-gradient-to-br from-[#152420] via-[#1a302a] to-[#23423a] text-white rounded-3xl p-8 sm:p-14 mb-10 shadow-xl relative overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-500/30 mb-4">
            🌿 Traditional Healing • Modern Care
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">About Us</h1>
          <p className="text-emerald-200 text-base sm:text-lg font-medium mt-3 italic">
            "Rooted in Tradition. Guided by Nature. Inspired by You."
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-12 shadow-sm space-y-12">
        
        {/* Welcome Section */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#152420] flex items-center gap-3">
            <span className="text-2xl">🌿</span> Welcome to Ayurveda Arogya
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Ayurveda Arogya is your trusted companion on the path to natural healing and holistic well-being. We are an online Ayurvedic consultation, medicine, and wellness store dedicated to bringing the timeless wisdom of Ayurveda into the lives of modern individuals — in the most authentic and accessible way possible.
          </p>
        </section>

        {/* Who We Are & What We Do Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#152420]">Who We Are</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Ayurveda Arogya is more than just a brand — it's a commitment to restoring balance in body, mind, and spirit through the principles of Ayurveda. Founded by <strong className="text-[#152420]">Dr. Anamika Choudhary, BAMS, MD</strong>, we empower individuals to take charge of their health using nature’s finest remedies.
            </p>
          </div>

          <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#152420] text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#152420]">What We Do</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Authentic Ayurvedic medicines and formulations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Personalized online Ayurvedic consultations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Panchkarma-based detox & rejuvenation therapies (via partner clinics)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Wellness and lifestyle products rooted in Ayurvedic science</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Informative content, tips, and blogs for self-care & prevention</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Our Philosophy Banner */}
        <div className="bg-gradient-to-r from-[#152420] to-[#1d352e] text-white rounded-2xl p-8 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">Classical Sanskrit Shloka</span>
            <blockquote className="text-lg sm:text-xl font-serif italic text-emerald-100 border-l-4 border-emerald-500 pl-4 py-1">
              “Swasthasya Swasthya Rakshanam, Aturasya Vikara Prashamanam”
            </blockquote>
            <p className="text-xs text-gray-300 mt-2">
              — To preserve the health of the healthy and to cure the diseases of the ailing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-emerald-400 text-sm block">Purity</span>
              <p className="text-gray-300">Certified and reputed Ayurvedic manufacturers.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-emerald-400 text-sm block">Integrity</span>
              <p className="text-gray-300">Transparent practices, dosage and ingredients.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-emerald-400 text-sm block">Care</span>
              <p className="text-gray-300">Personalized support through certified practitioners.</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#152420]">Why Choose Ayurveda Arogya?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "100% genuine Ayurvedic medicines",
              "Doctor-reviewed and approved formulations",
              "Easy and secure online ordering",
              "Doorstep delivery across India",
              "Confidential online consultations",
              "Ongoing customer support and health tracking"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-gray-800">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Vision & Promise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xl font-bold text-[#152420]">Our Vision</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              To become a leading Ayurvedic wellness platform that reconnects people with nature's healing intelligence and redefines preventive, personalized, and sustainable healthcare for all.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xl font-bold text-[#152420]">Our Promise</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We promise to remain faithful to the classical roots of Ayurveda while embracing innovation to meet the needs of the modern world. We do not promote quick fixes but advocate long-term wellness based on balance, discipline, and nature's rhythm.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            to="/book-appointment"
            className="inline-flex items-center justify-center gap-2 bg-[#152420] hover:bg-[#1c322b] text-white px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition"
          >
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            Book Doctor Consultation
          </Link>
        </div>

      </div>

    </div>
  );
}
