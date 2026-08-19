import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, cartTotal, showToast } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'AYUR20') {
      setDiscountPercent(20);
      showToast('Coupon AYUR20 applied! 20% discount added.');
    } else {
      showToast('Invalid Coupon. Try "AYUR20"', 'error');
    }
  };

  const shippingFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 49;
  const discountAmount = (cartTotal * discountPercent) / 100;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-200 bg-[#152420] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Your Shopping Cart</h2>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-3xl mb-4">
                  🌿
                </div>
                <h3 className="text-lg font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Discover authentic Ayurvedic churnas, tablets, asavs, and oils in our store.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 bg-[#152420] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-emerald-900 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-1 border border-gray-200 shrink-0"
                    onError={(e) => { e.target.src = '/assets/iqkgtttwyi7hddjqvcuw.webp'; }}
                  />

                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] font-semibold text-emerald-700">{item.brand}</p>
                    
                    {item.isBulkSplit && (
                      <span className="inline-block mt-0.5 bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        🌿 30/70 Bulk Split Rate
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-sm font-black text-[#152420]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-gray-400 block">
                            (₹{item.price.toFixed(2)}/unit)
                          </span>
                        )}
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. AYUR20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-xs font-semibold uppercase focus:outline-none focus:ring-1 focus:ring-[#152420]"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                  Apply
                </button>
              </form>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">₹{cartTotal.toFixed(2)}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-700 uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded">FREE</span>
                  ) : (
                    <span className="font-bold text-gray-800">₹{shippingFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-base font-black text-[#152420] pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Free shipping progress */}
              {cartTotal < 500 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg text-center font-medium border border-amber-200">
                  Add ₹{(500 - cartTotal).toFixed(2)} more for FREE Delivery! 🚚
                </p>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleProceedCheckout}
                className="w-full bg-[#152420] hover:bg-[#1b2f28] text-white text-sm font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Safe & Secure Checkout with Razorpay / UPI</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
