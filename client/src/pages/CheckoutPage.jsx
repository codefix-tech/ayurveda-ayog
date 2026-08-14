import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, CreditCard, Truck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, showToast } = useCart();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  // Address fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  const shippingFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 49;
  const finalTotal = cartTotal + shippingFee;

  // COD order handler (no payment gateway)
  const placeCODOrder = async () => {
    try {
      const res = await createOrder({
        items: cart,
        shippingAddress: { fullName, phone, email, street, city, state, pincode },
        paymentMethod: 'COD',
        totalAmount: finalTotal
      });

      if (res && res.success) {
        setOrderPlaced(res.order);
        clearCart();
        showToast('Order placed successfully! Pay on delivery.');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        showToast(res?.message || 'Failed to place COD order. Please try again.', 'error');
      }
    } catch (err) {
      console.error('COD order placement error:', err);
      showToast('Error placing COD order. Please try again.', 'error');
    }
  };

  // Razorpay payment handler
  const initiateRazorpayPayment = async () => {
    try {
      // 1. Create Razorpay order on backend
      const rpOrder = await createRazorpayOrder(finalTotal, `rcpt_${Date.now()}`);

      if (!rpOrder.success) {
        showToast('Failed to initiate payment. Try again.', 'error');
        return;
      }

      // 2. If Razorpay keys are NOT configured (test mode), simulate success
      if (!rpOrder.isLiveGateway) {
        showToast('Razorpay keys not set — using simulated payment ✓');
        const orderRes = await createOrder({
          items: cart,
          shippingAddress: { fullName, phone, email, street, city, state, pincode },
          paymentMethod: 'Razorpay (Simulated Test)',
          totalAmount: finalTotal,
          razorpayOrderId: rpOrder.orderId
        });

        if (orderRes.success) {
          setOrderPlaced(orderRes.order);
          clearCart();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
        return;
      }

      // 3. Open real Razorpay checkout popup
      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Ayurveda Arogya',
        description: `Order Payment - ${cart.length} item(s)`,
        order_id: rpOrder.orderId,
        handler: async function (response) {
          // 4. Verify payment signature on backend
          const verifyRes = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verifyRes.success && verifyRes.verified) {
            // 5. Save confirmed order to MongoDB
            const orderRes = await createOrder({
              items: cart,
              shippingAddress: { fullName, phone, email, street, city, state, pincode },
              paymentMethod: 'Razorpay / Online',
              totalAmount: finalTotal,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            });

            if (orderRes.success) {
              setOrderPlaced(orderRes.order);
              clearCart();
              showToast('Payment successful! Order placed.');
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }
          } else {
            showToast('Payment verification failed. Please contact support.', 'error');
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: {
          color: '#152420'
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            showToast('Payment cancelled.', 'error');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Razorpay payment error:', err);
      showToast('Payment failed. Please try again.', 'error');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!fullName || !phone || !street || !city || !pincode) {
      showToast('Please fill in all mandatory delivery address fields', 'error');
      return;
    }

    try {
      setSubmitting(true);

      if (paymentMethod === 'COD') {
        await placeCODOrder();
      } else {
        await initiateRazorpayPayment();
      }
    } catch (err) {
      console.error('Order checkout error:', err);
      showToast('Failed to place order. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-16 text-center font-sans">
        <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-700" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Completed
          </span>

          <h1 className="text-3xl font-black text-[#152420] mt-3">
            Order Confirmed!
          </h1>

          <p className="text-xs text-gray-600 mt-1">
            Order Number: <span className="font-extrabold text-gray-900">{orderPlaced.id}</span>
          </p>

          <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-bold">Estimated Delivery:</span>
              <span className="font-bold text-emerald-800">{orderPlaced.estimatedDelivery}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-bold">Shipping Address:</span>
              <span className="font-bold text-gray-800">{orderPlaced.shippingAddress.street}, {orderPlaced.shippingAddress.city} - {orderPlaced.shippingAddress.pincode}</span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 font-bold">Payment Method:</span>
              <span className="font-bold text-gray-800">{orderPlaced.paymentMethod}</span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-gray-500 font-bold">Total Paid:</span>
              <span className="font-black text-[#152420] text-sm">₹{orderPlaced.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <Link to="/shop">
              <button className="bg-[#152420] text-white text-xs font-bold px-8 py-3.5 rounded-xl shadow hover:bg-emerald-900 transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-1">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="mt-6 inline-block bg-[#152420] text-white text-xs font-bold px-6 py-3 rounded-xl">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 font-sans">
      
      <div className="flex items-center gap-2 mb-6">
        <Link to="/shop" className="text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152420]">
          Secure Checkout
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Delivery Address & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-[#152420] mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              1. Delivery Shipping Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nishant Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">House / Flat / Street Address *</label>
                <input
                  type="text"
                  placeholder="Flat 402, Green Avenue, Main Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    placeholder="110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-[#152420] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              2. Select Payment Option
            </h2>

            <div className="space-y-3">
              <label 
                onClick={() => setPaymentMethod('Razorpay')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'Razorpay' ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Razorpay / UPI / Cards / NetBanking</p>
                    <p className="text-[10px] text-gray-500">Instant & 100% Encrypted Payment via Razorpay</p>
                  </div>
                </div>
                <input type="radio" checked={paymentMethod === 'Razorpay'} readOnly className="accent-[#152420]" />
              </label>

              <label 
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">💵</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-gray-500">Pay cash upon package arrival</p>
                  </div>
                </div>
                <input type="radio" checked={paymentMethod === 'COD'} readOnly className="accent-[#152420]" />
              </label>
            </div>
          </div>

        </div>

        {/* Order Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm sticky top-24 space-y-4">
            <h2 className="text-base font-extrabold text-[#152420] pb-3 border-b border-gray-100">
              Order Summary ({cart.length} item{cart.length > 1 ? 's' : ''})
            </h2>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
              {cart.map(item => (
                <div key={item.id} className="py-3 flex gap-3 items-center">
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                    <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Shipping</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-700 uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">₹{shippingFee}</span>
                )}
              </div>
              <div className="flex justify-between text-base font-black text-[#152420] pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#152420] hover:bg-[#1b2f28] text-white text-sm font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Processing Payment...' : paymentMethod === 'COD' ? `Place COD Order (₹${finalTotal.toFixed(2)})` : `Pay & Place Order (₹${finalTotal.toFixed(2)})`}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Razorpay Verified 256-Bit SSL Encrypted</span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
