const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 25 },
  inStock: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  description: { type: String, required: true },
  usage: { type: String },
  ingredients: { type: String }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

module.exports = mongoose.model('Product', productSchema);
