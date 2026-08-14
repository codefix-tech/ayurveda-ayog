import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import CollectionsCarousel from '../components/CollectionsCarousel';
import ProductCard from '../components/ProductCard';
import BrandsGrid from '../components/BrandsGrid';
import { fetchProducts, fetchCategories, fetchBrands } from '../services/api';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, RefreshCw, ThumbsUp } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catRes, brandRes, featRes, newRes] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchProducts({ featured: 'true' }),
          fetchProducts({ isNew: 'true' })
        ]);

        if (catRes.categories) setCategories(catRes.categories);
        if (brandRes.brands) setBrands(brandRes.brands);
        if (featRes.products) setFeaturedProducts(featRes.products);
        if (newRes.products) setNewArrivals(newRes.products);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 font-sans">
      
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Choose By Collections */}
      <CollectionsCarousel categories={categories} />

      {/* 3. Featured Products Section */}
      <section className="py-10 my-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Handpicked Essentials
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#152420]">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Top rated Ayurvedic medicines recommended by certified practitioners
            </p>
          </div>

          <Link to="/shop?sort=rating" className="text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
            View All Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Doctor Consultation Banner */}
      <section className="my-10 bg-gradient-to-r from-[#152420] via-[#1b4138] to-[#254d43] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Online Vaidya Tele-Consultation
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-4 leading-tight">
            Consult Experienced Ayurvedic Doctors Online
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
            Get personalized dosage plans, diet charts (Pathya-Apathya), and remedy guidance for chronic acidity, joint pains, skin allergies, and digestive health.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/book-appointment">
              <button className="bg-emerald-500 hover:bg-emerald-400 text-[#152420] text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Book Doctor Consultation
              </button>
            </Link>
          </div>
        </div>

        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-8 border-white/10 bg-emerald-900/40 p-4">
          <img 
            src="/assets/l2cfjrmzmass6l2zhmal.webp" 
            alt="Ayurvedic Doctor Consultation" 
            className="w-full h-full object-cover rounded-full shadow-2xl"
          />
        </div>
      </section>

      {/* 5. New Arrivals Section */}
      <section className="py-10 my-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#152420]">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Newly launched formulations and fresh batches added to store
            </p>
          </div>
          <Link to="/shop?isNew=true" className="text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
            Explore New <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Shop By Brands */}
      <BrandsGrid brands={brands} />

      {/* 7. Why Choose Ayurveda Arogya */}
      <section className="my-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#152420] text-sm">100% Genuine Medicine</h3>
            <p className="text-xs text-gray-500 mt-1">Direct from certified Ayurvedic pharmacies.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#152420] text-sm">Easy Returns & Refund</h3>
            <p className="text-xs text-gray-500 mt-1">7-day hassle-free return guarantee.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#152420] text-sm">Expert Consultation</h3>
            <p className="text-xs text-gray-500 mt-1">Online advice from qualified BAMS doctors.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#152420] text-sm">Trusted by Thousands</h3>
            <p className="text-xs text-gray-500 mt-1">Over 25,000+ satisfied wellness customers.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
