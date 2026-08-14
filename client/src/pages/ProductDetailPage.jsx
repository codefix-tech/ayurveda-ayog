import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await fetchProductById(id);
        if (res.success) {
          setProduct(res.product);
          setRelated(res.relatedProducts || []);
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-96 bg-gray-100 animate-pulse rounded-3xl"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <Link to="/shop" className="mt-4 inline-block bg-[#152420] text-white text-xs font-bold px-6 py-3 rounded-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 font-sans">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#152420]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/shop" className="hover:text-[#152420]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#152420] font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 flex flex-col md:flex-row gap-10">
        
        {/* Left: Product Image */}
        <div className="w-full md:w-1/2 bg-gray-50 rounded-2xl p-8 flex items-center justify-center relative border border-gray-100">
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          <img 
            src={product.image} 
            alt={product.title}
            className="max-h-[350px] object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = '/assets/iqkgtttwyi7hddjqvcuw.webp'; }}
          />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {product.brand}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600 font-medium">{product.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#152420] mt-3 leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewsCount} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#152420]">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <del className="text-base text-gray-400">
                  ₹{product.originalPrice.toFixed(2)}
                </del>
              )}
            </div>

            <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Usage & Ingredients */}
            <div className="mt-6 space-y-3">
              {product.usage && (
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 text-xs">
                  <span className="font-extrabold text-[#152420]">Recommended Usage: </span>
                  <span className="text-gray-700">{product.usage}</span>
                </div>
              )}

              {product.ingredients && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                  <span className="font-extrabold text-[#152420]">Key Ingredients: </span>
                  <span className="text-gray-700">{product.ingredients}</span>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3.5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 bg-[#152420] hover:bg-[#1b2f28] text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] text-gray-600 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-[#152420] mb-6">Related Ayurvedic Formulations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
