import React from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';

export default function BrandsGrid({ brands = [] }) {
  return (
    <section className="w-full py-10 my-6 bg-emerald-50/40 rounded-3xl p-6 sm:p-10 border border-emerald-100/80">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Award className="w-3.5 h-3.5" />
          Trusted Manufacturers
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#152420]">
          Shop By Brands
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Explore products from India's most respected Ayurvedic and herbal pharmaceutical brands
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {brands.map((b) => (
          <Link
            key={b.id}
            to={`/shop?brand=${encodeURIComponent(b.name)}`}
            className="group bg-white hover:bg-[#152420] border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">{b.logo || '🌿'}</span>
              <div className="text-left">
                <h3 className="text-xs sm:text-sm font-black text-gray-800 group-hover:text-white transition-colors line-clamp-1">
                  {b.name}
                </h3>
                <span className="text-[10px] text-gray-400 group-hover:text-emerald-300 font-medium">
                  Official Store
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
