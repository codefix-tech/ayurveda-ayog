const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/dbManager');
const Order = require('../models/Order');
const { getMongoStatus } = require('../config/db');
const { protect, optionalAuth, admin } = require('../middleware/auth');
const { depleteBatches } = require('../utils/batchHelper');

// Helper: generate collision-resistant order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// POST create order / checkout & save to MongoDB / File DB (Supports guest & logged-in checkout)
router.post('/orders', optionalAuth, async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalAmount, discountAmount, razorpayOrderId, razorpayPaymentId, priceBreakdown } = req.body;

  if (!items || !items.length || !shippingAddress) {
    return res.status(400).json({
      success: false,
      message: 'Cart items and shipping address are required to place an order.'
    });
  }

  // Basic validation on shipping address
  if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
    return res.status(400).json({
      success: false,
      message: 'Full name, phone, street, city, and pincode are required in shipping address.'
    });
  }

  // Strict 6-digit Indian PIN Code format validation
  const cleanPincode = shippingAddress.pincode.toString().trim().replace(/\D/g, '');
  if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid 6-digit Indian delivery pincode (e.g. 110001 or 248001)'
    });
  }

  // Validate totalAmount
  if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid total amount is required.'
    });
  }

  const orderData = {
    id: generateOrderId(),
    userId: req.user ? (req.user._id || req.user.id) : null,
    items: items.map(item => ({
      id: item.id,
      title: (item.title || '').substring(0, 200),
      price: Number(item.price) || 0,
      quantity: Math.max(1, Math.min(100, Number(item.quantity) || 1)),
      image: item.image || '',
      brand: (item.brand || '').substring(0, 100),
      // Batch split details per item (if applicable)
      isBulkSplit: item.isBulkSplit || false,
      blendedUnitPrice: item.blendedUnitPrice || null,
      batchBreakdown: Array.isArray(item.batchBreakdown) ? item.batchBreakdown : []
    })),
    // Overall price breakdown across all items (batch-level)
    priceBreakdown: Array.isArray(priceBreakdown) ? priceBreakdown : [],
    shippingAddress: {
      fullName: shippingAddress.fullName.substring(0, 100),
      phone: shippingAddress.phone.substring(0, 20),
      email: (shippingAddress.email || '').substring(0, 100),
      street: shippingAddress.street.substring(0, 300),
      city: shippingAddress.city.substring(0, 100),
      state: (shippingAddress.state || '').substring(0, 100),
      pincode: shippingAddress.pincode.substring(0, 10)
    },
    paymentMethod: paymentMethod || 'Razorpay / Online',
    totalAmount: Number(totalAmount),
    discountAmount: Number(discountAmount) || 0,
    paymentStatus: paymentMethod === 'COD' ? 'Pending (COD)' : 'Paid',
    orderStatus: 'Processing',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null,
    createdAt: new Date().toISOString()
  };

  try {
    if (getMongoStatus()) {
      const orderDoc = new Order(orderData);
      await orderDoc.save();
    }
  } catch (err) {
    console.error('Mongo order save error:', err.message);
  }

  // Always save to file database
  db.saveOrder(orderData);

  // Deplete batch stock for all items that have batch breakdown info
  try {
    const allSplitItems = [];
    orderData.items.forEach(item => {
      if (Array.isArray(item.batchBreakdown) && item.batchBreakdown.length > 0) {
        item.batchBreakdown.forEach(b => allSplitItems.push({ batchId: b.batchId, qty: b.qty }));
      }
    });
    if (allSplitItems.length > 0) {
      await depleteBatches(allSplitItems);
    }
  } catch (depErr) {
    console.error('Batch depletion error (non-fatal):', depErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Order placed & saved to database successfully!',
    order: orderData
  });
});

// GET current user's orders (Protected — users see only their own orders)
router.get('/orders/my', protect, async (req, res) => {
  const userId = req.user._id || req.user.id;
  
  try {
    if (getMongoStatus()) {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      if (orders.length > 0) {
        return res.json({ success: true, count: orders.length, orders });
      }
    }
  } catch (err) {
    console.error('Mongo user orders fetch error:', err.message);
  }

  // File DB fallback
  const allOrders = db.getOrders();
  const userOrders = allOrders.filter(o => o.userId === userId);
  res.json({ success: true, count: userOrders.length, orders: userOrders });
});

// GET order by ID (Protected — user can only see their own, admin can see any)
router.get('/orders/:id', protect, async (req, res) => {
  try {
    if (getMongoStatus()) {
      const order = await Order.findOne({ id: req.params.id });
      if (order) {
        // Check ownership: user can only see their own orders, admin can see all
        const userId = req.user._id?.toString() || req.user.id;
        if (req.user.role !== 'admin' && order.userId?.toString() !== userId) {
          return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }
        return res.json({ success: true, order });
      }
    }
  } catch (err) {
    console.error('Mongo order lookup error:', err.message);
  }

  const orders = db.getOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Check ownership for file DB too
  const userId = req.user._id || req.user.id;
  if (req.user.role !== 'admin' && order.userId !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }

  res.json({ success: true, order });
});

// GET all orders (Admin only)
router.get('/orders', protect, admin, async (req, res) => {
  try {
    if (getMongoStatus()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    }
  } catch (err) {
    console.error('Mongo all orders fetch error:', err.message);
  }

  const orders = db.getOrders();
  res.json({ success: true, count: orders.length, orders });
});

// PUT update order status (Admin only)
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  const { orderStatus } = req.body;

  if (!orderStatus) {
    return res.status(400).json({ success: false, message: 'orderStatus is required' });
  }

  // Validate status value
  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ success: false, message: `orderStatus must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    if (getMongoStatus()) {
      const order = await Order.findOneAndUpdate(
        { id: req.params.id },
        { orderStatus },
        { new: true }
      );
      if (order) return res.json({ success: true, order });
    }
  } catch (err) {
    console.error('Mongo order status update error:', err.message);
  }

  // File fallback update
  const updatedOrder = db.updateOrderStatus(req.params.id, orderStatus);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, order: updatedOrder });
});

// PUT update order tracking & courier details (Admin only)
router.put('/orders/:id/tracking', protect, admin, async (req, res) => {
  const { trackingNumber, courier, estimatedDelivery } = req.body;

  const updateFields = {};
  if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber.trim();
  if (courier !== undefined) updateFields.courier = courier.trim();
  if (estimatedDelivery !== undefined) updateFields.estimatedDelivery = estimatedDelivery.trim();

  let updatedOrder = null;

  try {
    if (getMongoStatus()) {
      updatedOrder = await Order.findOneAndUpdate(
        { id: req.params.id },
        updateFields,
        { new: true }
      );
    }
  } catch (err) {
    console.error('Mongo order tracking update error:', err.message);
  }

  // File fallback update
  const fileUpdated = db.updateOrderTracking(req.params.id, updateFields);
  if (!updatedOrder && fileUpdated) {
    updatedOrder = fileUpdated;
  }

  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, message: 'Order tracking updated', order: updatedOrder });
});

// GET /api/pincode/:code - Verify delivery PIN code & lookup City/State
router.get('/pincode/:code', async (req, res) => {
  const pincode = (req.params.code || '').trim().replace(/\D/g, '');

  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: 'Invalid pincode format. Must be a 6-digit number.'
    });
  }

  // Fast fallback state resolver based on Indian Postal Circle first 2 digits
  const prefix2 = pincode.substring(0, 2);
  const stateMap = {
    '11': { state: 'Delhi', region: 'Delhi NCR' },
    '12': { state: 'Haryana', region: 'Gurgaon/Faridabad' },
    '13': { state: 'Haryana', region: 'Ambala/Panipat' },
    '14': { state: 'Punjab', region: 'Ludhiana/Amritsar' },
    '15': { state: 'Punjab', region: 'Bathinda/Ferozepur' },
    '16': { state: 'Chandigarh', region: 'Chandigarh' },
    '17': { state: 'Himachal Pradesh', region: 'Shimla/Dharamshala' },
    '18': { state: 'Jammu & Kashmir', region: 'Jammu' },
    '19': { state: 'Jammu & Kashmir', region: 'Srinagar' },
    '20': { state: 'Uttar Pradesh', region: 'Noida/Aligarh' },
    '21': { state: 'Uttar Pradesh', region: 'Prayagraj' },
    '22': { state: 'Uttar Pradesh', region: 'Lucknow/Varanasi' },
    '23': { state: 'Uttar Pradesh', region: 'Faizabad' },
    '24': { state: 'Uttarakhand', region: 'Dehradun/Haridwar' },
    '25': { state: 'Uttar Pradesh', region: 'Meerut' },
    '26': { state: 'Uttarakhand', region: 'Nainital/Almora' },
    '27': { state: 'Uttar Pradesh', region: 'Gorakhpur' },
    '28': { state: 'Uttar Pradesh', region: 'Agra/Jhansi' },
    '30': { state: 'Rajasthan', region: 'Jaipur' },
    '31': { state: 'Rajasthan', region: 'Udaipur' },
    '32': { state: 'Rajasthan', region: 'Kota' },
    '33': { state: 'Rajasthan', region: 'Bikaner' },
    '34': { state: 'Rajasthan', region: 'Jodhpur' },
    '36': { state: 'Gujarat', region: 'Rajkot' },
    '37': { state: 'Gujarat', region: 'Kutch' },
    '38': { state: 'Gujarat', region: 'Ahmedabad' },
    '39': { state: 'Gujarat', region: 'Surat/Vadodara' },
    '40': { state: 'Maharashtra', region: 'Mumbai/Goa' },
    '41': { state: 'Maharashtra', region: 'Pune' },
    '42': { state: 'Maharashtra', region: 'Nashik' },
    '43': { state: 'Maharashtra', region: 'Aurangabad' },
    '44': { state: 'Maharashtra', region: 'Nagpur' },
    '45': { state: 'Madhya Pradesh', region: 'Indore' },
    '46': { state: 'Madhya Pradesh', region: 'Bhopal' },
    '47': { state: 'Madhya Pradesh', region: 'Gwalior' },
    '48': { state: 'Madhya Pradesh', region: 'Jabalpur' },
    '49': { state: 'Chhattisgarh', region: 'Raipur' },
    '50': { state: 'Telangana', region: 'Hyderabad' },
    '51': { state: 'Andhra Pradesh', region: 'Kurnool/Tirupati' },
    '52': { state: 'Andhra Pradesh', region: 'Vijayawada' },
    '53': { state: 'Andhra Pradesh', region: 'Visakhapatnam' },
    '56': { state: 'Karnataka', region: 'Bengaluru' },
    '57': { state: 'Karnataka', region: 'Mangaluru' },
    '58': { state: 'Karnataka', region: 'Hubli/Belgaum' },
    '59': { state: 'Karnataka', region: 'Belagavi' },
    '60': { state: 'Tamil Nadu', region: 'Chennai' },
    '61': { state: 'Tamil Nadu', region: 'Thanjavur' },
    '62': { state: 'Tamil Nadu', region: 'Madurai' },
    '63': { state: 'Tamil Nadu', region: 'Salem' },
    '64': { state: 'Tamil Nadu', region: 'Coimbatore' },
    '67': { state: 'Kerala', region: 'Kozhikode' },
    '68': { state: 'Kerala', region: 'Kochi' },
    '69': { state: 'Kerala', region: 'Thiruvananthapuram' },
    '70': { state: 'West Bengal', region: 'Kolkata' },
    '71': { state: 'West Bengal', region: 'Howrah' },
    '72': { state: 'West Bengal', region: 'Midnapore' },
    '73': { state: 'West Bengal', region: 'Siliguri' },
    '74': { state: 'West Bengal', region: 'North 24 Parganas' },
    '75': { state: 'Odisha', region: 'Bhubaneswar' },
    '76': { state: 'Odisha', region: 'Cuttack' },
    '77': { state: 'Odisha', region: 'Sambalpur' },
    '78': { state: 'Assam', region: 'Guwahati' },
    '79': { state: 'North East', region: 'Shillong/Agartala' },
    '80': { state: 'Bihar', region: 'Patna' },
    '81': { state: 'Bihar', region: 'Bhagalpur' },
    '82': { state: 'Bihar', region: 'Gaya' },
    '83': { state: 'Jharkhand', region: 'Ranchi/Jamshedpur' },
    '84': { state: 'Bihar', region: 'Muzaffarpur' },
    '85': { state: 'Bihar', region: 'Purnia' }
  };

  let resolvedCity = stateMap[prefix2]?.region || 'District Headquarters';
  let resolvedState = stateMap[prefix2]?.state || 'India';

  // Attempt India Post API lookup with a 2-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const apiRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        resolvedCity = po.District || po.Name || resolvedCity;
        resolvedState = po.State || resolvedState;
      }
    }
  } catch (err) {
    // If API timeout or offline, use regional prefix resolver
  }

  res.json({
    success: true,
    valid: true,
    pincode,
    city: resolvedCity,
    state: resolvedState,
    country: 'India',
    deliverable: true,
    estimatedDays: '3-4 business days',
    codAvailable: true,
    deliveryPartner: 'BlueDart / Delhivery / India Post'
  });
});

module.exports = router;
