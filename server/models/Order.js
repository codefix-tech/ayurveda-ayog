const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  price: Number,
  quantity: Number,
  image: String,
  brand: String
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  pincode: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, index: true }, // Links order to authenticated user
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: { type: String, default: 'Razorpay / Online' },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'Paid' },
  orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },
  estimatedDelivery: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
