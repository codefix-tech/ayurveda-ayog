const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/dbManager');
const Order = require('../models/Order');
const { getMongoStatus } = require('../config/db');
const { protect, optionalAuth, admin } = require('../middleware/auth');

// Helper: generate collision-resistant order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// POST create order / checkout & save to MongoDB / File DB (Supports guest & logged-in checkout)
router.post('/orders', optionalAuth, async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalAmount, discountAmount } = req.body;

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

  // Validate totalAmount
  if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid total amount is required.'
    });
  }

  const orderData = {
    id: generateOrderId(),
    userId: req.user ? (req.user._id || req.user.id) : null, // Attach user ID if logged in
    items: items.map(item => ({
      id: item.id,
      title: (item.title || '').substring(0, 200),
      price: Number(item.price) || 0,
      quantity: Math.max(1, Math.min(100, Number(item.quantity) || 1)), // Clamp 1-100
      image: item.image || '',
      brand: (item.brand || '').substring(0, 100)
    })),
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

module.exports = router;
