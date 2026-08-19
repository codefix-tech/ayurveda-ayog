const ProductBatch = require('../models/ProductBatch');
const BulkSplitRule = require('../models/BulkSplitRule');
const Product = require('../models/Product');
const { getMongoStatus } = require('../config/db');

/**
 * Generate a batch number like BATCH-001, BATCH-002 etc.
 */
async function generateBatchNumber(productId) {
  if (getMongoStatus()) {
    const count = await ProductBatch.countDocuments({ productId });
    return `BATCH-${String(count + 1).padStart(3, '0')}`;
  }
  return `BATCH-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Get or auto-initialize the active batch for a product.
 * If no batch exists for an existing product, automatically create BATCH-001.
 */
async function getActiveBatch(productId) {
  if (!getMongoStatus()) return null;

  let active = await ProductBatch.findOne({ productId, isActive: true, isOldLot: false });

  // If no active batch found, check if product exists and auto-create initial batch BATCH-001
  if (!active) {
    const prod = await Product.findOne({ id: productId });
    if (prod) {
      const stock = typeof prod.stock === 'number' ? prod.stock : 50;
      active = new ProductBatch({
        productId,
        batchNumber: 'BATCH-001',
        sellingPrice: prod.price || 100,
        costPrice: 0,
        totalStock: stock,
        remainingStock: stock,
        isActive: true,
        isOldLot: false,
        purchaseDate: prod.createdAt || new Date()
      });
      await active.save();

      // Ensure default bulk split rule exists
      await BulkSplitRule.findOneAndUpdate(
        { productId },
        { productId, minBulkQty: 5, oldBatchRatio: 0.30, newBatchRatio: 0.70, isActive: true },
        { upsert: true, new: true }
      );
    }
  }

  return active;
}

/**
 * Get all old-lot batches that still have stock.
 */
async function getOldBatchesWithStock(productId) {
  if (!getMongoStatus()) return [];
  return ProductBatch.find({
    productId,
    isOldLot: true,
    remainingStock: { $gt: 0 }
  }).sort({ createdAt: 1 }); // oldest first
}

/**
 * Get all old-lot batches (including out-of-stock) for display.
 */
async function getAllOldBatches(productId) {
  if (!getMongoStatus()) return [];
  return ProductBatch.find({ productId, isOldLot: true }).sort({ createdAt: 1 });
}

/**
 * Calculate the bulk split for an order.
 *
 * Implements:
 * 1. 30/70 ratio between old price lot and new price lot for bulk orders (qty >= minBulkQty).
 * 2. If old rate lot is out of stock / depleted, falls back to latest rate with clear outOfStock indication.
 * 3. Handles partial old stock gracefully.
 */
async function calculateBulkSplit(productId, qty) {
  const result = {
    isSplit: false,
    items: [],
    blendedUnitPrice: 0,
    totalPrice: 0,
    oldBatchOutOfStock: false,
    oldBatchAvailable: false
  };

  if (!getMongoStatus()) return result;

  const activeBatch = await getActiveBatch(productId);
  if (!activeBatch) return result;

  let rule = await BulkSplitRule.findOne({ productId, isActive: true });
  if (!rule) {
    rule = { minBulkQty: 5, oldBatchRatio: 0.30, newBatchRatio: 0.70 };
  }

  const allOldBatches = await getAllOldBatches(productId);
  const oldBatchesWithStock = await getOldBatchesWithStock(productId);

  const hasAnyOldLots = allOldBatches.length > 0;
  const hasOldStock = oldBatchesWithStock.length > 0;

  // Case 1: Quantity is less than minimum bulk threshold OR no old lots exist at all
  if (qty < rule.minBulkQty || !hasAnyOldLots) {
    result.isSplit = false;
    result.items = [{
      batchId: activeBatch._id ? activeBatch._id.toString() : 'active',
      batchNumber: activeBatch.batchNumber,
      qty,
      unitPrice: activeBatch.sellingPrice,
      label: 'Latest Rate',
      isOldLot: false
    }];
    result.blendedUnitPrice = activeBatch.sellingPrice;
    result.totalPrice = Math.round(activeBatch.sellingPrice * qty * 100) / 100;
    result.oldBatchOutOfStock = hasAnyOldLots && !hasOldStock;
    result.oldBatchAvailable = hasOldStock;
    return result;
  }

  // Case 2: Bulk quantity requested, but old lot exists and is OUT OF STOCK
  if (hasAnyOldLots && !hasOldStock) {
    result.isSplit = false;
    result.oldBatchOutOfStock = true;
    result.oldBatchAvailable = false;
    result.items = [{
      batchId: activeBatch._id ? activeBatch._id.toString() : 'active',
      batchNumber: activeBatch.batchNumber,
      qty,
      unitPrice: activeBatch.sellingPrice,
      label: 'Latest Rate (Old Lot Out of Stock)',
      isOldLot: false
    }];
    result.blendedUnitPrice = activeBatch.sellingPrice;
    result.totalPrice = Math.round(activeBatch.sellingPrice * qty * 100) / 100;
    return result;
  }

  // Case 3: Bulk quantity requested and Old Lot HAS stock -> 30-70 split
  const oldBatch = oldBatchesWithStock[0];
  result.oldBatchAvailable = true;

  // Calculate 30% from old batch, 70% from new batch
  let desiredOldQty = Math.round(qty * rule.oldBatchRatio);
  if (desiredOldQty === 0 && qty >= rule.minBulkQty) desiredOldQty = 1;

  // Cap by available old batch stock
  const actualOldQty = Math.min(desiredOldQty, oldBatch.remainingStock);
  const actualNewQty = qty - actualOldQty;

  result.items = [];

  if (actualOldQty > 0) {
    result.items.push({
      batchId: oldBatch._id.toString(),
      batchNumber: oldBatch.batchNumber,
      qty: actualOldQty,
      unitPrice: oldBatch.sellingPrice,
      label: 'Old Rate Lot',
      isOldLot: true
    });
  }

  if (actualNewQty > 0) {
    result.items.push({
      batchId: activeBatch._id.toString(),
      batchNumber: activeBatch.batchNumber,
      qty: actualNewQty,
      unitPrice: activeBatch.sellingPrice,
      label: 'Latest Rate',
      isOldLot: false
    });
  }

  result.isSplit = result.items.length > 1;

  const totalCost = result.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  result.blendedUnitPrice = Math.round((totalCost / qty) * 100) / 100;
  result.totalPrice = Math.round(totalCost * 100) / 100;
  result.oldBatchOutOfStock = (oldBatch.remainingStock - actualOldQty) <= 0;

  return result;
}

/**
 * Deduct stock from batches & product inventory after order is confirmed.
 */
async function depleteBatches(splitItems, productId = null, fallbackQty = 0) {
  if (!getMongoStatus()) return;

  if (Array.isArray(splitItems) && splitItems.length > 0) {
    for (const item of splitItems) {
      if (!item.batchId || item.batchId === 'active') continue;
      const batch = await ProductBatch.findById(item.batchId);
      if (batch) {
        batch.remainingStock = Math.max(0, batch.remainingStock - (item.qty || 1));
        if (batch.remainingStock === 0 && batch.isOldLot) {
          batch.isActive = false;
        }
        await batch.save();

        // Also update product aggregate stock
        await Product.findOneAndUpdate(
          { id: batch.productId },
          { $inc: { stock: -(item.qty || 1) } }
        );
      }
    }
  } else if (productId && fallbackQty > 0) {
    // If no batch breakdown provided, deduct from active batch
    const active = await getActiveBatch(productId);
    if (active) {
      active.remainingStock = Math.max(0, active.remainingStock - fallbackQty);
      await active.save();
    }
    await Product.findOneAndUpdate(
      { id: productId },
      { $inc: { stock: -fallbackQty } }
    );
  }
}

/**
 * Add a new batch for a product.
 * Automatically marks all previous active batches as old lots.
 */
async function addBatch({ productId, sellingPrice, costPrice, totalStock, purchaseDate, expiryDate, notes }) {
  if (!getMongoStatus()) {
    throw new Error('MongoDB not connected');
  }

  // Mark existing active batch as old lot
  await ProductBatch.updateMany(
    { productId, isActive: true, isOldLot: false },
    { isOldLot: true }
  );

  const batchNumber = await generateBatchNumber(productId);

  const batch = new ProductBatch({
    productId,
    batchNumber,
    sellingPrice: Number(sellingPrice),
    costPrice: Number(costPrice) || 0,
    totalStock: Number(totalStock),
    remainingStock: Number(totalStock),
    isActive: true,
    isOldLot: false,
    purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    notes: notes || ''
  });

  await batch.save();
  return batch;
}

module.exports = {
  addBatch,
  getActiveBatch,
  getOldBatchesWithStock,
  getAllOldBatches,
  calculateBulkSplit,
  depleteBatches
};
