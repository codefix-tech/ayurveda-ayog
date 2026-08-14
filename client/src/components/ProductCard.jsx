import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useCart();

  const isWishlisted = wishlist.some(p => p.id === product.id);
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="group relative w-full border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Top Badges & Actions */}
      <div className="relative w-full h-[220px] bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs z-10">
            {discountPercent}% OFF
          </span>
        )}

        {/* New Badge */}
        {product.isNew && (
          <span className="absolute top-3 left-16 bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded-full z-10">
            NEW
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md z-10 transition ${
            isWishlisted 
              ? 'bg-red-50 text-red-500 hover:bg-red-100' 
              : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-[180px] max-w-[180px] object-contain transform group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/assets/iqkgtttwyi7hddjqvcuw.webp';
            }}
          />
        </Link>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center z-10">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="w-full bg-white/95 text-gray-800 text-xs font-bold py-2 rounded-xl border border-gray-300 shadow-md hover:bg-[#152420] hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick Preview
          </button>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
            <span className="uppercase tracking-wider text-emerald-800 font-bold">{product.brand}</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{product.category}</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-[#152420] text-sm sm:text-base line-clamp-2 hover:text-emerald-800 transition min-h-[40px]">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-gray-700">{product.rating}</span>
            <span className="text-[11px] text-gray-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-[#152420]">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <del className="text-xs text-gray-400 ml-1.5">
                ₹{product.originalPrice.toFixed(2)}
              </del>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-[#152420] hover:bg-[#1b2f28] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow hover:shadow-lg transition flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

    </div>
  );
}
