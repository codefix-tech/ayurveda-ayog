import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CollectionsCarousel({ categories = [] }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-8 my-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#152420] tracking-tight">
            Choose By Collections
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Explore authentic remedies categorized by traditional Ayurvedic forms
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-xs transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-xs transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative w-full">
        <div 
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar py-2"
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="snap-start shrink-0 w-[220px] sm:w-[240px] group"
            >
              <div className="w-full h-[280px] bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden flex flex-col items-center justify-between p-4 transition-all duration-300 group-hover:-translate-y-1">
                <div className="relative w-full h-[190px] rounded-xl overflow-hidden bg-emerald-50/50 p-2 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/assets/bn61pi8fcf4tmhf6pewo.webp';
                    }}
                  />
                </div>
                <div className="w-full text-center py-2 bg-gray-50 rounded-xl group-hover:bg-[#152420] transition-colors duration-300">
                  <h3 className="text-sm font-bold text-[#152420] group-hover:text-white transition-colors duration-300">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
