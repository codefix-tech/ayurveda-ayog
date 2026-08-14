import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Phone, Twitter, Linkedin, Instagram, Calendar, MapPin, ChevronDown, LogOut, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { cartCount, setIsCartOpen, searchQuery, setSearchQuery } = useCart();
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const topBrands = [
    'HIMALAYA', 'BAIDYANATH', 'DABUR', 'ZANDU', 'DHOOTPAPESHWAR', 
    'AIMIL PHARMACEUTICALS', 'CHARAK', 'KERALA AYURVEDA', 'KOTTAKAL', 'SRI SRI'
  ];

  return (
    <header className="w-full font-sans">
      {/* Top utility bar */}
      <div className="hidden md:block bg-[#152420] text-white text-xs px-6 lg:px-16 py-2.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <ul className="flex gap-6 items-center">
            <li>
              <Link to="/contact" className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                <MapPin className="w-3.5 h-3.5" />
                Store Location & Contact
              </Link>
            </li>
            <li className="text-gray-400">|</li>
            <li>
              <Link to="/book-appointment" className="flex items-center gap-1.5 hover:text-emerald-400 transition font-medium text-emerald-300">
                <Calendar className="w-3.5 h-3.5" />
                Book Doctor Consultation
              </Link>
            </li>
          </ul>

          <div className="flex gap-4 items-center">
            <span className="text-gray-400 text-xs">Follow Us:</span>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-16 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-700 hover:text-emerald-800 transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#152420] to-[#1b4138] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <span className="text-xl">🌿</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-[#152420] tracking-tight group-hover:text-emerald-800 transition">
                Ayurveda Arogya
              </span>
              <span className="text-[10px] tracking-widest text-emerald-700 uppercase font-semibold -mt-1">
                Authentic Wellness Store
              </span>
            </div>
          </Link>

          {/* Live Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="Search medicines, brands, categories (e.g. Abhyarishta, Himalaya)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#152420] focus:bg-white shadow-inner transition"
              />
              <button type="submit" className="absolute right-3 text-gray-500 hover:text-[#152420] transition">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-gray-700">
            <Link to="/" className="hover:text-[#152420] transition py-1">Home</Link>
            <Link to="/shop" className="hover:text-[#152420] transition py-1">Shop</Link>

            {/* Brands Dropdown */}
            <div 
              className="relative cursor-pointer py-1"
              onMouseEnter={() => setIsBrandsDropdownOpen(true)}
              onMouseLeave={() => setIsBrandsDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 hover:text-[#152420] transition">
                <span>Brands</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              {isBrandsDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top Brands</div>
                  {topBrands.map(brand => (
                    <Link
                      key={brand}
                      to={`/shop?brand=${encodeURIComponent(brand)}`}
                      className="block px-4 py-1.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#152420] transition"
                      onClick={() => setIsBrandsDropdownOpen(false)}
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/book-appointment" className="text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Calendar className="w-3.5 h-3.5" />
              Appointments
            </Link>
            <Link to="/contact" className="hover:text-[#152420] transition py-1">Contact</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-amber-700 hover:text-amber-900 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Cart & Profile Actions */}
          <div className="flex items-center gap-3">
            <Link 
              to="/book-appointment" 
              className="hidden sm:flex lg:hidden items-center gap-1 text-xs bg-[#152420] text-white px-3 py-2 rounded-lg font-medium shadow"
            >
              <Calendar className="w-3.5 h-3.5" />
              Consult Doctor
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-[#152420] bg-gray-100 hover:bg-gray-200 rounded-full transition"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Dropdown / Buttons */}
            {user ? (
              <div className="relative" onMouseLeave={() => setIsUserDropdownOpen(false)}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  onMouseEnter={() => setIsUserDropdownOpen(true)}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold transition"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-600" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-[#152420] text-white hover:bg-emerald-900 px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sub-header Bar (#EEF4F5) */}
      <div className="bg-[#EEF4F5] text-[#1b4138] px-4 sm:px-6 lg:px-16 py-2.5 text-xs border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-4 text-xs font-semibold text-[#152420] flex-wrap">
            <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-emerald-800 border border-emerald-200 shadow-xs">
              ✨ 100% Authentic Ayurvedic Formulations
            </span>
            <span className="hidden sm:inline text-gray-500">• Fast Pan-India Delivery</span>
            <span className="hidden md:inline text-gray-500">• Free Doctor Advice on Orders Over ₹500</span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-emerald-900">
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Support Helpline: +91 (800) 425-2987</span>
          </div>
        </div>
      </div>

      {/* Mobile Slide-over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-[85%] max-w-xs bg-[#152420] text-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div className="p-5 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌿</span>
                  <span className="font-bold text-lg text-white">Ayurveda Arogya</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="mb-6">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-3 pr-8 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
                  />
                  <button type="submit" className="absolute right-2 text-white/70">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-3 text-sm font-medium">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-300 py-2 border-b border-white/10">Home</Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-300 py-2 border-b border-white/10">Shop All Products</Link>
                <Link to="/book-appointment" onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-400 font-semibold py-2 border-b border-white/10 flex items-center justify-between">
                  <span>Book Doctor Consultation</span>
                  <span className="text-xs bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">Specialist</span>
                </Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-300 py-2 border-b border-white/10">Contact Us</Link>

                <div className="pt-4">
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">Featured Brands</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                    {topBrands.slice(0, 8).map(brand => (
                      <Link
                        key={brand}
                        to={`/shop?brand=${encodeURIComponent(brand)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded text-center truncate"
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            <div className="p-5 border-t border-white/10 bg-black/20 text-xs text-white/70">
              <p>📍 Helpline: +91 (800) 425-2987</p>
              <p className="mt-1">© 2026 Ayurveda Arogya. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
