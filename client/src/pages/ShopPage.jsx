import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchCategories, fetchBrands } from '../services/api';
import { Filter, X, SlidersHorizontal, RefreshCw } from 'lucide-react';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter state
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '';
  const [maxPrice, setMaxPrice] = useState(500);

  useEffect(() => {
    async function loadShopData() {
      try {
        setLoading(true);
        const [catRes, brandRes, prodRes] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchProducts({
            category: currentCategory,
            brand: currentBrand,
            search: currentSearch,
            sort: currentSort,
            maxPrice: maxPrice
          })
        ]);

        if (catRes.categories) setCategories(catRes.categories);
        if (brandRes.brands) setBrands(brandRes.brands);
        if (prodRes.products) setProducts(prodRes.products);
      } catch (err) {
        console.error('Error fetching shop data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadShopData();
  }, [currentCategory, currentBrand, currentSearch, currentSort, maxPrice]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setMaxPrice(500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#152420]">
            {currentCategory ? `Collection: ${currentCategory}` : currentBrand ? `Brand: ${currentBrand}` : 'Shop All Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {products.length} authentic Ayurvedic formulation{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Selector */}
        <div className="w-full md:w-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-700 hidden sm:inline">Sort By:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#152420]"
            >
              <option value="">Default Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8 pt-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <h3 className="font-extrabold text-[#152420] text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-emerald-800" /> Filters
            </h3>
            {(currentCategory || currentBrand || currentSearch || maxPrice < 500) && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Price Range Slider */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Max Price: ₹{maxPrice}
            </label>
            <input
              type="range"
              min="100"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#152420] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-bold mt-1">
              <span>₹100</span>
              <span>₹500</span>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !currentCategory ? 'bg-[#152420] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.name)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition flex justify-between items-center ${
                    currentCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#152420] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">
              Brands
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilter('brand', '')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !currentBrand ? 'bg-[#152420] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Brands
              </button>
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => updateFilter('brand', b.name)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition flex justify-between items-center ${
                    currentBrand.toLowerCase() === b.name.toLowerCase()
                      ? 'bg-[#152420] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Product Grid Area */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-12 text-center">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-gray-800 mt-3">No products match your filter criteria</h3>
              <p className="text-xs text-gray-500 mt-1">Try resetting the filters or searching for different terms.</p>
              <button
                onClick={clearAllFilters}
                className="mt-6 bg-[#152420] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  );
}
