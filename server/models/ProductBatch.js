const mongoose = require('mongoose');

/**
 * ProductBatch — represents a single price-lot of a product.
 * When admin receives a new shipment at a different price,
 * they create a new batch instead of overwriting the old price.
 */
const productBatchSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  totalStock: {
    type: Number,
    required: true,
    min: 0
  },
  remainingStock: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOldLot: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

productBatchSchema.index({ productId: 1, isActive: 1 });
productBatchSchema.index({ productId: 1, isOldLot: 1 });

module.exports = mongoose.model('ProductBatch', productBatchSchema);
