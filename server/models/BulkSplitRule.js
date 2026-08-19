const mongoose = require('mongoose');

/**
 * BulkSplitRule — defines when and how to split a bulk order
 * between an old-lot batch and the current active batch.
 * Default: 30% old lot, 70% new lot when qty >= minBulkQty
 */
const bulkSplitRuleSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Minimum quantity that triggers the split logic
  minBulkQty: {
    type: Number,
    default: 5,
    min: 1
  },
  // Fraction from old batch (0.30 = 30%)
  oldBatchRatio: {
    type: Number,
    default: 0.30,
    min: 0,
    max: 1
  },
  // Fraction from new/active batch (0.70 = 70%)
  newBatchRatio: {
    type: Number,
    default: 0.70,
    min: 0,
    max: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BulkSplitRule', bulkSplitRuleSchema);
