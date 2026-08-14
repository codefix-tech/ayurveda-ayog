import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Stethoscope } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#a4b9b7d7] via-[#ccece5d4] to-[#9fc8beb3] shadow-lg border border-emerald-100 my-4">
      <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 md:px-16 py-10 md:py-16 gap-8">
        
        {/* Left Text Block */}
        <div className="flex-1 text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#152420] border border-emerald-200/60 shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Authentic E-Pharmacy & Tele-Ayurveda
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#152420] leading-tight tracking-tight">
            Buy Medicines Online <br />
            <span className="text-emerald-900 underline decoration-emerald-400 decoration-wavy decoration-2">
              Easily & Safely
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-800 leading-relaxed font-medium">
            Get authentic Ayurvedic formulations, classical churnas, asavs, and health supplements delivered right to your door with trusted quality and flat discounts.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/shop">
              <button className="bg-[#152420] hover:bg-[#1b2f28] text-white text-sm sm:text-base font-semibold px-7 py-3.5 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                Shop All Medicines
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link to="/book-appointment">
              <button className="bg-white hover:bg-emerald-50 text-[#152420] text-sm sm:text-base font-semibold px-6 py-3.5 rounded-xl border border-emerald-800/20 shadow-sm hover:shadow transition flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                Book Doctor Consult
              </button>
            </Link>
          </div>

          {/* Highlights */}
          <div className="mt-10 pt-6 border-t border-emerald-900/10 grid grid-cols-3 gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 hidden sm:block" />
              <span className="text-xs font-bold text-[#152420]">100% Genuine Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-800 shrink-0 hidden sm:block" />
              <span className="text-xs font-bold text-[#152420]">Pan-India Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg hidden sm:block">🌿</span>
              <span className="text-xs font-bold text-[#152420]">Certified Vaidyas</span>
            </div>
          </div>
        </div>

        {/* Right Hero Banner Image */}
        <div className="flex-1 flex justify-center md:justify-end w-full">
          <div className="relative w-full max-w-[340px] sm:max-w-[440px] md:max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/60 bg-white/40">
            <img 
              src="/assets/AyurvedaArogyaHeroBanner.webp" 
              alt="Ayurveda Arogya Pharmacy Banner" 
              className="w-full h-full object-cover rounded-xl transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/80 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-xs font-bold text-gray-900">4.9/5 Rating</p>
                  <p className="text-[10px] text-gray-600">Over 25,000+ Happy Customers</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">Verified</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
