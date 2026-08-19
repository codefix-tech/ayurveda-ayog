const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductBatch = require('../models/ProductBatch');
const BulkSplitRule = require('../models/BulkSplitRule');
const { protect, admin } = require('../middleware/auth');
const {
  addBatch,
  getActiveBatch,
  getAllOldBatches,
  getOldBatchesWithStock,
  calculateBulkSplit,
  depleteBatches
} = require('../utils/batchHelper');
const { getMongoStatus } = require('../config/db');

// ─────────────────────────────────────────────
// POST /api/batches/add  (Admin only)
// Add a new price batch to a product. Old batch automatically becomes isOldLot:true
// ─────────────────────────────────────────────
router.post('/batches/add', protect, admin, async (req, res) => {
  const { productId, sellingPrice, costPrice, totalStock, purchaseDate, expiryDate, notes } = req.body;

  if (!productId || !sellingPrice || !totalStock) {
    return res.status(400).json({
      success: false,
      message: 'productId, sellingPrice and totalStock are required.'
    });
  }

  if (Number(sellingPrice) <= 0 || Number(totalStock) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'sellingPrice and totalStock must be positive numbers.'
    });
  }

  if (!getMongoStatus()) {
    return res.status(503).json({
      success: false,
      message: 'Batch feature requires MongoDB connection.'
    });
  }

  // Verify product exists
  const product = await Product.findOne({ id: productId });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  try {
    const batch = await addBatch({
      productId,
      sellingPrice: Number(sellingPrice),
      costPrice: Number(costPrice) || 0,
      totalStock: Number(totalStock),
      purchaseDate,
      expiryDate,
      notes
    });

    // Update product display price to the new batch's price
    await Product.findOneAndUpdate(
      { id: productId },
      {
        price: Number(sellingPrice),
        activeBatchId: batch._id.toString(),
        displayPrice: Number(sellingPrice),
        stock: Number(totalStock),
        inStock: Number(totalStock) > 0
      }
    );

    // Auto-create a default BulkSplitRule for this product if not exists
    await BulkSplitRule.findOneAndUpdate(
      { productId },
      { productId, minBulkQty: 5, oldBatchRatio: 0.30, newBatchRatio: 0.70, isActive: true },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: `New batch ${batch.batchNumber} added. Product price updated to ₹${sellingPrice}.`,
      batch
    });
  } catch (err) {
    console.error('Add batch error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/batches/:productId  (Admin only)
// Get all batches (active + old lots) for a product
// ─────────────────────────────────────────────
router.get('/batches/:productId', protect, admin, async (req, res) => {
  if (!getMongoStatus()) {
    return res.json({ success: true, batches: [], message: 'MongoDB not connected' });
  }

  try {
    const activeBatch = await getActiveBatch(req.params.productId);
    const oldBatches = await getAllOldBatches(req.params.productId);
    const rule = await BulkSplitRule.findOne({ productId: req.params.productId });

    return res.json({
      success: true,
      activeBatch,
      oldBatches,
      bulkSplitRule: rule
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/batches/info/:productId  (Public)
// Customer-facing: Get old-lot availability and active price for product page
// ─────────────────────────────────────────────
router.get('/batches/info/:productId', async (req, res) => {
  if (!getMongoStatus()) {
    return res.json({ success: true, hasOldLots: false, oldBatches: [], activeBatch: null });
  }

  try {
    const activeBatch = await getActiveBatch(req.params.productId);
    const oldBatchesWithStock = await getOldBatchesWithStock(req.params.productId);
    const allOldBatches = await getAllOldBatches(req.params.productId);
    const rule = await BulkSplitRule.findOne({ productId: req.params.productId, isActive: true });

    // Only expose necessary fields to the public
    const publicOldBatches = allOldBatches.map(b => ({
      batchNumber: b.batchNumber,
      sellingPrice: b.sellingPrice,
      remainingStock: b.remainingStock,
      isOutOfStock: b.remainingStock === 0
    }));

    return res.json({
      success: true,
      hasOldLots: allOldBatches.length > 0,
      hasOldStock: oldBatchesWithStock.length > 0,
      oldBatches: publicOldBatches,
      activeBatch: activeBatch ? {
        batchNumber: activeBatch.batchNumber,
        sellingPrice: activeBatch.sellingPrice,
        remainingStock: activeBatch.remainingStock
      } : null,
      bulkRule: rule ? {
        minBulkQty: rule.minBulkQty,
        oldBatchRatio: rule.oldBatchRatio,
        newBatchRatio: rule.newBatchRatio
      } : null
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/batches/split  (Public)
// Calculate the 30/70 bulk split for a given product and quantity
// ─────────────────────────────────────────────
router.post('/batches/split', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || isNaN(Number(quantity)) || Number(quantity) < 1) {
    return res.status(400).json({
      success: false,
      message: 'productId and a valid quantity are required.'
    });
  }

  try {
    const splitResult = await calculateBulkSplit(productId, Number(quantity));
    return res.json({ success: true, ...splitResult });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/batches/deplete  (Internal — called from order creation)
// Decrease stock from batches after order is placed
// ─────────────────────────────────────────────
router.post('/batches/deplete', async (req, res) => {
  const { splitItems } = req.body;

  if (!splitItems || !Array.isArray(splitItems)) {
    return res.status(400).json({ success: false, message: 'splitItems array required.' });
  }

  try {
    await depleteBatches(splitItems);
    return res.json({ success: true, message: 'Stock depleted from batches.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/batches/rule/:productId  (Admin only)
// Update the bulk split rule ratios for a product
// ─────────────────────────────────────────────
router.put('/batches/rule/:productId', protect, admin, async (req, res) => {
  const { minBulkQty, oldBatchRatio, newBatchRatio, isActive } = req.body;

  if (!getMongoStatus()) {
    return res.status(503).json({ success: false, message: 'MongoDB not connected' });
  }

  const update = {};
  if (minBulkQty !== undefined) update.minBulkQty = Number(minBulkQty);
  if (oldBatchRatio !== undefined) {
    update.oldBatchRatio = Number(oldBatchRatio);
    update.newBatchRatio = 1 - Number(oldBatchRatio);
  }
  if (newBatchRatio !== undefined) update.newBatchRatio = Number(newBatchRatio);
  if (isActive !== undefined) update.isActive = Boolean(isActive);

  try {
    const rule = await BulkSplitRule.findOneAndUpdate(
      { productId: req.params.productId },
      { ...update, productId: req.params.productId },
      { upsert: true, new: true }
    );
    return res.json({ success: true, rule });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
