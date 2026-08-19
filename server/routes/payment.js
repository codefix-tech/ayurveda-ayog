const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Helper to initialize Razorpay instance if keys exist
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret) {
    return new Razorpay({
      key_id,
      key_secret,
    });
  }
  return null;
};

// @route   GET /api/payment/razorpay-key or /api/razorpay-key
// @desc    Get Razorpay Public Key ID
// @access  Public
router.get(['/razorpay-key', '/payment/razorpay-key'], (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || null;
  res.json({
    success: true,
    key_id: keyId,
    keyId,
    isConfigured: !!keyId
  });
});

// Create Razorpay Order Handler logic
const handleCreateOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Order amount is required' });
    }

    // Determine paise value:
    // If amount is passed in Rupees (e.g. 150.00), convert to paise (* 100 -> 15000).
    // If amount is already in paise (e.g. 15000), use as is.
    let paiseAmount = Math.round(Number(amount));
    if (paiseAmount < 100) {
      paiseAmount = Math.round(Number(amount) * 100);
    }

    // Check minimum requirement: 100 paise (₹1.00)
    if (paiseAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum order amount must be at least 100 paise (₹1.00)'
      });
    }

    const instance = getRazorpayInstance();

    // If Razorpay keys are configured in .env, create official Razorpay order
    if (instance) {
      const options = {
        amount: paiseAmount,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`
      };

      const razorpayOrder = await instance.orders.create(options);

      return res.json({
        success: true,
        isLiveGateway: true,
        order_id: razorpayOrder.id,
        orderId: razorpayOrder.id,
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    }

    // If keys not set, fallback to test simulated mode
    return res.json({
      success: true,
      isLiveGateway: false,
      order_id: `test_order_${Date.now()}`,
      orderId: `test_order_${Date.now()}`,
      id: `test_order_${Date.now()}`,
      amount: paiseAmount,
      currency,
      key_id: null,
      keyId: null,
      message: 'Razorpay keys not set in .env. Running in simulated mode.'
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message || error
    });
  }
};

// @route   POST /api/create-order or /api/payment/create-razorpay-order
router.post('/create-order', handleCreateOrder);
router.post('/create-razorpay-order', handleCreateOrder);
router.post('/payment/create-razorpay-order', handleCreateOrder);

// Verify Signature Handler logic
const handleVerifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing required signature verification fields (razorpay_order_id, razorpay_payment_id, razorpay_signature)'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'RAZORPAY_KEY_SECRET is not configured'
      });
    }

    // Compute HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: 'Payment verification failed',
      error: error.message || error
    });
  }
};

// @route   POST /api/verify-payment or /api/payment/verify-payment
router.post('/verify-payment', handleVerifyPayment);
router.post('/payment/verify-payment', handleVerifyPayment);

module.exports = router;
