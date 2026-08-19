const express = require('express');
const router = express.Router();
const db = require('../db/dbManager');
const Product = require('../models/Product');
const ProductBatch = require('../models/ProductBatch');
const BulkSplitRule = require('../models/BulkSplitRule');
const { getMongoStatus } = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// Helper: escape special regex characters from user input to prevent ReDoS
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET all products with filtering, search, and sorting
router.get('/products', async (req, res) => {
  let result = [];

  try {
    if (getMongoStatus()) {
      let query = {};
      const { search, category, brand, minPrice, maxPrice, featured, isNew, sort } = req.query;

      if (category) query.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
      if (brand) query.brand = new RegExp(`^${escapeRegex(brand)}$`, 'i');
      if (featured === 'true') query.isFeatured = true;
      if (isNew === 'true') query.isNew = true;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (search) {
        const safeSearch = escapeRegex(search);
        query.$or = [
          { title: new RegExp(safeSearch, 'i') },
          { category: new RegExp(safeSearch, 'i') },
          { brand: new RegExp(safeSearch, 'i') },
          { description: new RegExp(safeSearch, 'i') }
        ];
      }

      let mongoSort = {};
      if (sort === 'price-low') mongoSort.price = 1;
      else if (sort === 'price-high') mongoSort.price = -1;
      else if (sort === 'rating') mongoSort.rating = -1;
      else if (sort === 'title') mongoSort.title = 1;

      result = await Product.find(query).sort(mongoSort);
      if (result.length > 0) {
        return res.json({ success: true, total: result.length, products: result });
      }
    }
  } catch (err) {
    console.error('Mongo product fetch error:', err.message);
  }

  // Fallback to dbManager
  result = [...db.getProducts()];

  const { search, category, brand, minPrice, maxPrice, sort, featured, isNew } = req.query;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand) {
    result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (minPrice) {
    result = result.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    result = result.filter(p => p.price <= parseFloat(maxPrice));
  }

  if (featured === 'true') {
    result = result.filter(p => p.isFeatured);
  }
  if (isNew === 'true') {
    result = result.filter(p => p.isNew);
  }

  if (sort === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  res.json({
    success: true,
    total: result.length,
    products: result
  });
});

// GET single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const product = await Product.findOne({ id: req.params.id });
      if (product) {
        const related = await Product.find({ category: product.category, id: { $ne: product.id } }).limit(4);
        return res.json({ success: true, product, relatedProducts: related });
      }
    }
  } catch (err) {
    console.error('Mongo product lookup error:', err.message);
  }

  const products = db.getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  res.json({
    success: true,
    product,
    relatedProducts: related
  });
});

// GET all categories
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: db.getCategories()
  });
});

// GET all brands
router.get('/brands', (req, res) => {
  res.json({
    success: true,
    brands: db.getBrands()
  });
});

// POST create new product (Admin only — PROTECTED)
router.post('/products', protect, admin, async (req, res) => {
  const { title, category, brand, price, originalPrice, image, description, usage, ingredients, stock } = req.body;

  if (!title || !category || !price) {
    return res.status(400).json({ success: false, message: 'Title, category and price are required.' });
  }

  // Validate price is a positive number
  if (isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
  }

  const stockNum = stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Number(stock)) : 50;

  const newProduct = {
    id: `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title: title.trim().substring(0, 200),
    category: category.trim().substring(0, 100),
    brand: brand ? brand.trim().substring(0, 100) : 'Ayurveda Arogya',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price),
    image: image || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400',
    rating: 5.0,
    reviewsCount: 1,
    inStock: stockNum > 0,
    stock: stockNum,
    isFeatured: req.body.isFeatured === true || req.body.isFeatured === 'true',
    isNew: true,
    description: (description || 'Premium Ayurvedic herbal formulation.').substring(0, 2000),
    usage: (usage || 'As directed by physician.').substring(0, 500),
    ingredients: (ingredients || 'Natural herbal extracts.').substring(0, 500)
  };

  try {
    if (getMongoStatus()) {
      const prodDoc = new Product(newProduct);
      await prodDoc.save();

      // Create initial batch BATCH-001
      const initialBatch = new ProductBatch({
        productId: newProduct.id,
        batchNumber: 'BATCH-001',
        sellingPrice: Number(price),
        costPrice: 0,
        totalStock: stockNum,
        remainingStock: stockNum,
        isActive: true,
        isOldLot: false,
        purchaseDate: new Date()
      });
      await initialBatch.save();

      // Create default bulk split rule (5+ units -> 30% old / 70% new)
      await BulkSplitRule.create({
        productId: newProduct.id,
        minBulkQty: 5,
        oldBatchRatio: 0.30,
        newBatchRatio: 0.70,
        isActive: true
      });
    }
  } catch (err) {
    console.error('Mongo product save error:', err.message);
  }

  // Sync to file DB
  db.saveProduct(newProduct);

  res.status(201).json({
    success: true,
    message: 'Product added successfully!',
    product: newProduct
  });
});

// PUT update product (Admin only — PROTECTED)
router.put('/products/:id', protect, admin, async (req, res) => {
  const updateData = { ...req.body };
  
  if (updateData.price !== undefined) {
    updateData.price = Number(updateData.price);
  }
  if (updateData.originalPrice !== undefined) {
    updateData.originalPrice = Number(updateData.originalPrice);
  }
  if (updateData.stock !== undefined) {
    updateData.stock = Math.max(0, Number(updateData.stock));
    updateData.inStock = updateData.stock > 0;
  }

  let updatedProduct = null;

  try {
    if (getMongoStatus()) {
      updatedProduct = await Product.findOneAndUpdate(
        { id: req.params.id },
        updateData,
        { new: true }
      );
    }
  } catch (err) {
    console.error('Mongo product update error:', err.message);
  }

  // File fallback update
  const fileUpdated = db.updateProduct(req.params.id, updateData);
  if (!updatedProduct && fileUpdated) {
    updatedProduct = fileUpdated;
  }

  if (!updatedProduct) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
});

// DELETE remove product (Admin only — PROTECTED)
router.delete('/products/:id', protect, admin, async (req, res) => {
  let deleted = false;
  try {
    if (getMongoStatus()) {
      const resMongo = await Product.findOneAndDelete({ id: req.params.id });
      if (resMongo) deleted = true;
    }
  } catch (err) {
    console.error('Mongo product delete error:', err.message);
  }

  const fileDeleted = db.deleteProduct(req.params.id);
  if (fileDeleted) deleted = true;

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, message: 'Product removed from database' });
});

module.exports = router;
