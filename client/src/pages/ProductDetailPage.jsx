import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart, Star, ShieldCheck, Truck, RotateCcw,
  ChevronRight, PackageOpen, TrendingUp, TrendingDown,
  Layers, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, fetchBulkSplit } = useCart();

  // Batch info states
  const [batchInfo, setBatchInfo] = useState(null);
  const [splitData, setSplitData] = useState(null);
  const [splitLoading, setSplitLoading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await fetchProductById(id);
        if (res.success) {
          setProduct(res.product);
          setRelated(res.relatedProducts || []);
          fetchBatchInfo(res.product.id);
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const fetchBatchInfo = async (productId) => {
    try {
      const res = await fetch(`/api/batches/info/${productId}`);
      const data = await res.json();
      if (data.success) {
        setBatchInfo(data);
      }
    } catch (err) {
      console.error('Batch info fetch error:', err);
    }
  };

  const handleQuantityChange = useCallback(async (newQty) => {
    const validQty = Math.max(1, Math.min(200, Number(newQty) || 1));
    setQuantity(validQty);
    if (!product) return;

    const bulkMin = batchInfo?.bulkRule?.minBulkQty || 5;

    if (validQty >= bulkMin) {
      setSplitLoading(true);
      try {
        const split = await fetchBulkSplit(product.id, validQty);
        setSplitData(split);
      } catch (e) {
        setSplitData(null);
      } finally {
        setSplitLoading(false);
      }
    } else {
      setSplitData(null);
    }
  }, [product, batchInfo, fetchBulkSplit]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, splitData && splitData.isSplit ? splitData : null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 font-sans">
        <div className="h-96 bg-gray-100 animate-pulse rounded-3xl"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center font-sans">
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <Link to="/shop" className="mt-4 inline-block bg-[#152420] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-emerald-950 transition">
          Back to Shop
        </Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const bulkMin = batchInfo?.bulkRule?.minBulkQty || 5;
  const isBulkQty = quantity >= bulkMin;
  const hasOldLots = batchInfo?.hasOldLots;
  const hasOldStock = batchInfo?.hasOldStock;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 font-sans">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#152420]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/shop" className="hover:text-[#152420]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[#152420] font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 flex flex-col md:flex-row gap-10">

        {/* Left: Product Image */}
        <div className="w-full md:w-1/2 bg-gray-50 rounded-2xl p-8 flex items-center justify-center relative border border-gray-100 min-h-[350px]">
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          <img
            src={product.image}
            alt={product.title}
            className="max-h-[350px] object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = '/assets/iqkgtttwyi7hddjqvcuw.webp'; }}
          />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {product.brand}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 font-medium">{product.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#152420] mt-3 leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{product.rating || 4.8}</span>
              <span className="text-xs text-gray-400">({product.reviewsCount || 42} reviews)</span>
            </div>

            {/* Main Active Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#152420]">
                ₹{Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <del className="text-base text-gray-400 font-medium">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </del>
              )}
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                Latest Rate
              </span>
            </div>

            {/* ── Old Rate Lot Inventory Badges ── */}
            {hasOldLots && batchInfo.oldBatches.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Market Rate History &amp; Inventory Batches:
                </p>

                {batchInfo.oldBatches.map((batch, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold ${
                      batch.isOutOfStock
                        ? 'bg-gray-50 border-gray-200 text-gray-500'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {batch.isOutOfStock ? (
                        <PackageOpen className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <span>Old Rate Lot ({batch.batchNumber}) — </span>
                        <strong className="text-gray-900">₹{Number(batch.sellingPrice).toFixed(2)}</strong>
                        <span className="text-[11px] text-gray-500"> / unit</span>
                      </div>
                    </div>

                    {batch.isOutOfStock ? (
                      <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="bg-amber-200/70 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {batch.remainingStock} units left
                      </span>
                    )}
                  </div>
                ))}

                {/* If old lot is out of stock notice */}
                {!hasOldStock && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Previous lower-rate lot is <strong>Out of Stock</strong>. All orders are currently fulfilled from the newest batch at the latest market rate of <strong>₹{Number(product.price).toFixed(2)}</strong>.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Bulk Select Presets */}
            <div className="mt-5">
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Select Quantity (Bulk discounts auto-apply at 5+ units):
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 5, 10, 20].map(qtyVal => (
                  <button
                    key={qtyVal}
                    type="button"
                    onClick={() => handleQuantityChange(qtyVal)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      quantity === qtyVal
                        ? 'bg-[#152420] text-white border-[#152420] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {qtyVal === 1 ? '1 Unit' : `${qtyVal} Units ${qtyVal >= 5 && hasOldStock ? '(30/70 Split 🔥)' : '(Bulk)'}`}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 30/70 Bulk Split Pricing Card ── */}
            {isBulkQty && (
              <div className="mt-4 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/40 border border-emerald-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    30/70 Bulk Lot Split Breakdown
                  </p>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    {quantity} Units Total
                  </span>
                </div>

                {splitLoading ? (
                  <div className="py-4 text-center text-xs text-emerald-700 animate-pulse">
                    Calculating 30/70 batch lot split...
                  </div>
                ) : splitData ? (
                  <div className="mt-3 space-y-2">
                    {splitData.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-white/70 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.isOldLot ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span className={`font-bold ${item.isOldLot ? 'text-amber-900' : 'text-emerald-900'}`}>
                            {item.label} ({item.batchNumber})
                          </span>
                        </div>
                        <span className="text-gray-800 font-medium">
                          {item.qty} × ₹{Number(item.unitPrice).toFixed(2)} = <strong>₹{(item.qty * item.unitPrice).toFixed(2)}</strong>
                        </span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-emerald-200/70 flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-bold">Blended Unit Price:</span>
                      <span className="text-sm font-black text-emerald-950">
                        ₹{Number(splitData.blendedUnitPrice).toFixed(2)} / unit
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-gray-600 font-bold">Total Order Value:</span>
                      <span className="text-base font-black text-[#152420]">
                        ₹{Number(splitData.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-600">
                    All {quantity} units @ ₹{Number(product.price).toFixed(2)} = <strong>₹{(quantity * product.price).toFixed(2)}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Usage & Ingredients */}
            <div className="mt-5 space-y-2.5">
              {product.usage && (
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs">
                  <span className="font-extrabold text-[#152420]">Recommended Usage: </span>
                  <span className="text-gray-700">{product.usage}</span>
                </div>
              )}
              {product.ingredients && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                  <span className="font-extrabold text-[#152420]">Key Ingredients: </span>
                  <span className="text-gray-700">{product.ingredients}</span>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-3.5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-12 text-center text-sm font-bold text-gray-900 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-3.5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#152420] hover:bg-[#1b2f28] text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                {splitData && splitData.isSplit
                  ? `Add ${quantity} Units (Blended ₹${Number(splitData.blendedUnitPrice).toFixed(2)}/unit)`
                  : `Add to Cart — ₹${((splitData?.blendedUnitPrice || product.price) * quantity).toFixed(2)}`}
              </button>
            </div>

            {/* Badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] text-gray-600 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-[#152420] mb-6">Related Ayurvedic Formulations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
