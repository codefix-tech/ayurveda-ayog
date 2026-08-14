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

// @route   GET /api/payment/razorpay-key
// @desc    Get Razorpay Public Key ID
// @access  Public
router.get('/razorpay-key', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || null;
  res.json({
    success: true,
    keyId,
    isConfigured: !!keyId
  });
});

// @route   POST /api/payment/create-razorpay-order
// @desc    Create Razorpay Order
// @access  Public
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid order amount is required' });
    }

    const instance = getRazorpayInstance();

    // If Razorpay keys are configured in .env, create official Razorpay order
    if (instance) {
      const options = {
        amount: Math.round(Number(amount) * 100), // Amount in paise
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`
      };

      const razorpayOrder = await instance.orders.create(options);
      return res.json({
        success: true,
        isLiveGateway: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    }

    // If keys not yet provided, return simulated test gateway response for seamless local testing
    return res.json({
      success: true,
      isLiveGateway: false,
      orderId: `test_order_${Date.now()}`,
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      keyId: null,
      message: 'Razorpay keys not set in .env. Running in simulated test gateway mode.'
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// @route   POST /api/payment/verify-payment
// @desc    Verify Razorpay Payment Signature
// @access  Public
router.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      // Demo mode
      return res.json({ success: true, verified: true, mode: 'test' });
    }

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
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
