import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment, verifyPincodeApi } from '../services/api';
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, CreditCard, Truck, AlertCircle, MapPin, Check, RefreshCw } from 'lucide-react';
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

  // Pincode Verification States
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | 'checking' | 'verified' | 'invalid'
  const [pincodeInfo, setPincodeInfo] = useState(null);

  const shippingFee = cartTotal >= 500 || cartTotal === 0 ? 0 : 49;
  const finalTotal = cartTotal + shippingFee;

  // Auto-trigger Pincode verification when user types 6 digits
  useEffect(() => {
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length === 6 && /^[1-9][0-9]{5}$/.test(cleanPin)) {
      handleVerifyPincode(cleanPin);
    } else if (cleanPin.length > 0 && cleanPin.length !== 6) {
      setPincodeStatus(null);
      setPincodeInfo(null);
    }
  }, [pincode]);

  const handleVerifyPincode = async (codeToVerify) => {
    const pin = (codeToVerify || pincode).replace(/\D/g, '');
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setPincodeStatus('invalid');
      setPincodeInfo({ message: 'Please enter a valid 6-digit Indian PIN code' });
      return;
    }

    setPincodeStatus('checking');
    try {
      const res = await verifyPincodeApi(pin);
      if (res && res.valid) {
        setPincodeStatus('verified');
        setPincodeInfo(res);
        // Auto-fill city and state
        if (res.city) setCity(res.city);
        if (res.state) setState(res.state);
      } else {
        setPincodeStatus('invalid');
        setPincodeInfo({ message: res?.message || 'Delivery not serviceable to this PIN code' });
      }
    } catch (err) {
      setPincodeStatus('invalid');
      setPincodeInfo({ message: 'Could not verify PIN code. Please check connectivity.' });
    }
  };

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
      // 1. Create Razorpay order on backend (returns order_id, amount in paise, currency, key_id)
      const rpOrder = await createRazorpayOrder(finalTotal, `rcpt_${Date.now()}`);

      if (!rpOrder.success) {
        showToast(rpOrder.message || 'Failed to initiate payment. Try again.', 'error');
        return;
      }

      // 2. If Razorpay keys are NOT configured (simulated fallback mode)
      if (!rpOrder.isLiveGateway) {
        showToast('Razorpay keys not set — using simulated payment ✓');
        const orderRes = await createOrder({
          items: cart,
          shippingAddress: { fullName, phone, email, street, city, state, pincode },
          paymentMethod: 'Razorpay (Simulated Test)',
          totalAmount: finalTotal,
          razorpayOrderId: rpOrder.order_id || rpOrder.orderId
        });

        if (orderRes.success) {
          setOrderPlaced(orderRes.order);
          clearCart();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
        return;
      }

      const razorpayKey = rpOrder.key_id || rpOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      const razorpayOrderId = rpOrder.order_id || rpOrder.orderId || rpOrder.id;

      // 3. Open Razorpay checkout modal
      const options = {
        key: razorpayKey,
        amount: rpOrder.amount,
        currency: rpOrder.currency || 'INR',
        name: 'Ayurveda Arogya',
        description: `Order Payment - ${cart.length} item(s)`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success && verifyRes.verified) {
              // 5. Save confirmed order to database
              const orderRes = await createOrder({
                items: cart,
                shippingAddress: { fullName, phone, email, street, city, state, pincode },
                paymentMethod: 'Razorpay Standard Checkout',
                totalAmount: finalTotal,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id
              });

              if (orderRes.success) {
                setOrderPlaced(orderRes.order);
                clearCart();
                showToast('Payment verified successfully! Order placed.');
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              } else {
                showToast(orderRes.message || 'Payment verified, but failed to record order.', 'error');
              }
            } else {
              showToast(verifyRes.message || 'Payment signature verification failed. Order not placed.', 'error');
            }
          } catch (verifyErr) {
            console.error('Verification call error:', verifyErr);
            showToast('Failed to verify payment with server.', 'error');
          } finally {
            setSubmitting(false);
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
            showToast('Payment window closed by user.', 'error');
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response) {
        setSubmitting(false);
        console.error('Razorpay Payment Failed:', response.error);
        showToast(`Payment Failed: ${response.error.description || 'Transaction declined'}`, 'error');
      });

      razorpay.open();
    } catch (err) {
      console.error('Razorpay payment error:', err);
      showToast('Payment failed. Please try again.', 'error');
      setSubmitting(false);
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

    const cleanPin = pincode.replace(/\D/g, '');
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'error');
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

              {/* PINCODE & VERIFICATION SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Pincode with live verification */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700">Pincode *</label>
                    {pincodeStatus === 'checking' && (
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Verifying...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-[#152420] outline-none transition ${
                        pincodeStatus === 'verified' ? 'border-emerald-500 bg-emerald-50/20' :
                        pincodeStatus === 'invalid' ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                      }`}
                      required
                    />
                    {pincodeStatus === 'verified' && (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                    )}
                  </div>
                </div>

                {/* City (Auto-populated) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    placeholder="Auto-filled via PIN"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>

                {/* State (Auto-populated) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#152420]"
                    required
                  />
                </div>
              </div>

              {/* Serviceability Badge */}
              {pincodeStatus === 'verified' && pincodeInfo && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      🌿 Deliverable to {pincodeInfo.city}, {pincodeInfo.state}
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Estimated delivery in <strong>{pincodeInfo.estimatedDays || '3-4 business days'}</strong> via {pincodeInfo.deliveryPartner || 'Express Courier'} • COD Available ✓
                    </p>
                  </div>
                </div>
              )}

              {pincodeStatus === 'invalid' && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{pincodeInfo?.message || 'Invalid PIN code. Please enter a valid 6-digit postal code.'}</span>
                </div>
              )}

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

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 pr-1">
              {cart.map(item => (
                <div key={item.id} className="py-3">
                  <div className="flex gap-3 items-center">
                    <img src={item.image} alt={item.title} className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200 shrink-0" onError={(e) => { e.target.src = '/assets/iqkgtttwyi7hddjqvcuw.webp'; }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                    </div>
                    <span className="text-xs font-black text-gray-900 shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  {/* Batch breakdown sub-items */}
                  {item.isBulkSplit && Array.isArray(item.batchBreakdown) && item.batchBreakdown.length > 0 && (
                    <div className="mt-2 ml-14 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-[10px] space-y-1">
                      <p className="font-bold text-amber-900">📦 30/70 Lot Allocation:</p>
                      {item.batchBreakdown.map((b, bi) => (
                        <div key={bi} className="flex justify-between text-gray-700">
                          <span>{b.label} ({b.batchNumber}): {b.qty} unit{b.qty > 1 ? 's' : ''}</span>
                          <span className="font-semibold">@ ₹{b.unitPrice}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
              className="w-full bg-[#152420] hover:bg-emerald-950 text-white font-extrabold text-xs py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>Processing Order...</>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-400" />
                  {paymentMethod === 'COD' ? 'Confirm Cash on Delivery Order' : 'Proceed to Pay with Razorpay'}
                </>
              )}
            </button>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 flex items-center justify-center gap-2 text-[11px] text-emerald-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>100% Ayurvedic Purity Guarantee & Verified Delivery</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
