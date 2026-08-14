import React, { useState } from 'react';
import { X, ShoppingCart, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;

  const handleAdd = () => {
    addToCart(product, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 z-20 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row">
          
          {/* Image Side */}
          <div className="w-full sm:w-1/2 bg-gray-50 p-6 flex flex-col items-center justify-center relative">
            <img 
              src={product.image} 
              alt={product.title} 
              className="max-h-[260px] object-contain rounded-xl drop-shadow-md"
              onError={(e) => { e.target.src = '/assets/iqkgtttwyi7hddjqvcuw.webp'; }}
            />
            <span className="mt-4 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Authentic Formulation
            </span>
          </div>

          {/* Details Side */}
          <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <span>{product.brand}</span>
                <span>•</span>
                <span className="text-gray-500 font-medium">{product.category}</span>
              </div>

              <h2 className="text-xl font-extrabold text-[#152420] mt-1 line-clamp-2">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-xs font-bold text-gray-800">{product.rating}</span>
                <span className="text-xs text-gray-400">({product.reviewsCount} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#152420]">₹{product.price.toFixed(2)}</span>
                {product.originalPrice > product.price && (
                  <del className="text-sm text-gray-400">₹{product.originalPrice.toFixed(2)}</del>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Usage / Ingredients preview */}
              {product.usage && (
                <div className="mt-3 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-800">Usage: </span>
                  <span className="text-gray-600">{product.usage}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-200 font-bold"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-gray-800">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-200 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 bg-[#152420] hover:bg-[#1b2f28] text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
