import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  ShoppingBag, Calendar, Package, RefreshCw, CheckCircle, Clock, 
  XCircle, Truck, Search, Plus, Filter, ChevronRight, User, Phone, MapPin, 
  DollarSign, AlertTriangle, Edit3, Trash2, Check, X, ShieldAlert, Eye, FileText,
  ExternalLink, Layers, PackageOpen, TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'appointments' | 'products'
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add, object = edit
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Herbal Supplements',
    brand: 'Ayurveda Arogya',
    price: '',
    originalPrice: '',
    stock: 50,
    image: '',
    description: '',
    usage: '',
    ingredients: ''
  });

  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({ courier: 'BlueDart', trackingNumber: '', estimatedDelivery: '' });

  const [notesModalAppt, setNotesModalAppt] = useState(null);
  const [notesText, setNotesText] = useState('');

  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Batch modal state
  const [batchModalProduct, setBatchModalProduct] = useState(null); // product to add batch for
  const [batchForm, setBatchForm] = useState({
    sellingPrice: '',
    costPrice: '',
    totalStock: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: ''
  });
  const [productBatches, setProductBatches] = useState(null); // existing batches for selected product

  // Show Toast Notification Helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch data on tab change
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setOrders(data.orders || []);
      } else if (activeTab === 'appointments') {
        const res = await fetch('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setAppointments(data.appointments || []);
      } else if (activeTab === 'products') {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ORDER MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
        showToast(`Order status updated to "${newStatus}"`);
      } else {
        showToast(data.message || 'Error updating status', 'error');
      }
    } catch (err) {
      showToast('Server error updating status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${trackingModalOrder.id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(trackingForm)
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === trackingModalOrder.id ? { 
          ...o, 
          courier: trackingForm.courier, 
          trackingNumber: trackingForm.trackingNumber,
          estimatedDelivery: trackingForm.estimatedDelivery || o.estimatedDelivery
        } : o));
        showToast('Tracking details updated successfully!');
        setTrackingModalOrder(null);
      } else {
        showToast(data.message || 'Failed to update tracking', 'error');
      }
    } catch (err) {
      showToast('Error updating tracking info', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // APPOINTMENT MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleUpdateAppointmentStatus = async (apptId, newStatus) => {
    setUpdatingId(apptId);
    try {
      const res = await fetch(`/api/appointments/${apptId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(a => a.id === apptId ? { ...a, status: newStatus } : a));
        showToast(`Appointment marked as ${newStatus}`);
      } else {
        showToast(data.message || 'Error updating status', 'error');
      }
    } catch (err) {
      showToast('Server error updating appointment', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveApptNotes = async (e) => {
    e.preventDefault();
    if (!notesModalAppt) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${notesModalAppt.id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes: notesText })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(a => a.id === notesModalAppt.id ? { ...a, adminNotes: notesText } : a));
        showToast('Consultation notes saved successfully!');
        setNotesModalAppt(null);
      } else {
        showToast(data.message || 'Failed to save notes', 'error');
      }
    } catch (err) {
      showToast('Error saving consultation notes', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PRODUCT INVENTORY MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      category: 'Herbal Supplements',
      brand: 'Ayurveda Arogya',
      price: '',
      originalPrice: '',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400',
      description: '',
      usage: 'Take 1-2 capsules daily with warm water or as advised by physician.',
      ingredients: 'Pure standard Ayurvedic herbal extracts.'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title || prod.name || '',
      category: prod.category || 'Herbal Supplements',
      brand: prod.brand || 'Ayurveda Arogya',
      price: prod.price || '',
      originalPrice: prod.originalPrice || prod.price || '',
      stock: prod.stock !== undefined ? prod.stock : (prod.inStock ? 50 : 0),
      image: prod.image || '',
      description: prod.description || '',
      usage: prod.usage || '',
      ingredients: prod.ingredients || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.category) {
      showToast('Please fill in required fields (Title, Category, Price)', 'error');
      return;
    }

    setActionLoading(true);
    try {
      if (editingProduct) {
        // Edit existing product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(productForm)
        });
        const data = await res.json();
        if (data.success) {
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...data.product } : p));
          showToast('Product updated successfully!');
          setIsProductModalOpen(false);
        } else {
          showToast(data.message || 'Failed to update product', 'error');
        }
      } else {
        // Add new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(productForm)
        });
        const data = await res.json();
        if (data.success) {
          setProducts([data.product, ...products]);
          showToast('New product created successfully!');
          setIsProductModalOpen(false);
        } else {
          showToast(data.message || 'Failed to create product', 'error');
        }
      }
    } catch (err) {
      showToast('Error saving product data', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStockUpdate = async (product, delta) => {
    const currentStock = product.stock !== undefined ? product.stock : (product.inStock ? 50 : 0);
    const newStock = Math.max(0, currentStock + delta);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock, inStock: newStock > 0 })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock, inStock: newStock > 0 } : p));
      }
    } catch (err) {
      showToast('Failed to update stock count', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteConfirmProduct.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p.id !== deleteConfirmProduct.id));
        showToast('Product deleted successfully');
        setDeleteConfirmProduct(null);
      } else {
        showToast(data.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast('Error deleting product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // BATCH HANDLERS
  // -------------------------------------------------------------
  const openBatchModal = async (product) => {
    setBatchModalProduct(product);
    setBatchForm({
      sellingPrice: '',
      costPrice: '',
      totalStock: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      notes: ''
    });
    setProductBatches(null);
    // Fetch existing batches for this product
    try {
      const res = await fetch(`/api/batches/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProductBatches(data);
    } catch {
      // Batches not available
    }
  };

  const handleAddBatch = async () => {
    if (!batchModalProduct) return;
    if (!batchForm.sellingPrice || !batchForm.totalStock) {
      showToast('Selling price and stock are required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/batches/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: batchModalProduct.id,
          sellingPrice: Number(batchForm.sellingPrice),
          costPrice: Number(batchForm.costPrice) || 0,
          totalStock: Number(batchForm.totalStock),
          purchaseDate: batchForm.purchaseDate,
          expiryDate: batchForm.expiryDate || null,
          notes: batchForm.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`New batch added! Product price updated to ₹${batchForm.sellingPrice}`);
        // Refresh product list and batches
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (prodData.success) setProducts(prodData.products || []);
        // Refresh batches in modal
        const bRes = await fetch(`/api/batches/${batchModalProduct.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bData = await bRes.json();
        if (bData.success) setProductBatches(bData);
        setBatchForm({ sellingPrice: '', costPrice: '', totalStock: '', purchaseDate: new Date().toISOString().split('T')[0], expiryDate: '', notes: '' });
      } else {
        showToast(data.message || 'Failed to add batch', 'error');
      }
    } catch (err) {
      showToast('Error adding batch', 'error');
    } finally {
      setActionLoading(false);
    }
  };


  // KPI METRICS CALCULATIONS
  // -------------------------------------------------------------
  const totalRevenue = orders.reduce((acc, curr) => {
    return curr.orderStatus !== 'Cancelled' ? acc + (Number(curr.totalAmount) || 0) : acc;
  }, 0);

  const activeOrdersCount = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Shipped').length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'Confirmed').length;
  const lowStockCount = products.filter(p => (p.stock !== undefined && p.stock <= 10) || p.inStock === false).length;

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.shippingAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.shippingAddress?.phone || '').includes(searchTerm) ||
                          (o.shippingAddress?.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = (a.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.patientPhone || '').includes(searchTerm) ||
                          (a.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredProducts = products.filter(p => 
    (p.title || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] pb-20 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-bounce ${
          notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-900 text-emerald-50 border border-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-200" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#152420] text-white py-10 px-6 sm:px-12 border-b border-emerald-950/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1.5">
              <span>🛡️ Executive Admin Panel</span>
              <span className="text-gray-400">•</span>
              <span className="text-amber-400">Live Control Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight">Ayurveda Arogya HQ</h1>
            <p className="text-emerald-200/80 text-sm mt-1.5 max-w-2xl">
              Real-time store management, automated courier dispatch tracking, inventory stock levels, and clinical consultations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddProduct}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-900/30 transition"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            )}
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-600/40 transition shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Live KPI Metric Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-[#1c2f2a] border border-emerald-800/40 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold uppercase">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-emerald-400/80">From {orders.length} total orders</span>
          </div>

          <div className="bg-[#1c2f2a] border border-emerald-800/40 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-blue-300 text-xs font-semibold uppercase">
              <span>Active Orders</span>
              <Truck className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{activeOrdersCount}</p>
            <span className="text-[11px] text-blue-300/80">Processing & in transit</span>
          </div>

          <div className="bg-[#1c2f2a] border border-emerald-800/40 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-amber-300 text-xs font-semibold uppercase">
              <span>Doctor Sessions</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{pendingAppointmentsCount}</p>
            <span className="text-[11px] text-amber-300/80">Confirmed consultations</span>
          </div>

          <div className="bg-[#1c2f2a] border border-emerald-800/40 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-rose-300 text-xs font-semibold uppercase">
              <span>Low Stock Alert</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-300 mt-2">{lowStockCount}</p>
            <span className="text-[11px] text-rose-300/80">Products &lt; 10 units</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); setStatusFilter('all'); }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition ${
              activeTab === 'orders'
                ? 'bg-[#152420] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Management</span>
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('appointments'); setSearchTerm(''); setStatusFilter('all'); }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition ${
              activeTab === 'appointments'
                ? 'bg-[#152420] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Doctor Appointments</span>
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'appointments' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('products'); setSearchTerm(''); setStatusFilter('all'); }}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition ${
              activeTab === 'products'
                ? 'bg-[#152420] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Inventory</span>
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {products.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, ID, phone...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>

          {activeTab !== 'products' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'orders' ? (
                  <>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </>
                ) : (
                  <>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-4 font-medium">Fetching verified dashboard records...</p>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* ORDERS TAB CONTENT */}
            {/* ========================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-14 text-center rounded-2xl border border-gray-200 text-gray-500">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700 text-base">No orders found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or filters.</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id || order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 hover:shadow-md transition">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-extrabold text-gray-900 text-base sm:text-lg">{order.id}</span>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                              order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                            {order.razorpayPaymentId && (
                              <span className="text-[11px] bg-purple-50 text-purple-700 font-semibold px-2.5 py-0.5 rounded border border-purple-200">
                                💳 Razorpay: {order.razorpayPaymentId}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5">
                            Placed on {new Date(order.createdAt).toLocaleString('en-IN')} • Payment: <strong className="text-gray-800">{order.paymentStatus}</strong> ({order.paymentMethod})
                          </p>
                        </div>

                        {/* Order Status & Tracking Actions */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            onClick={() => {
                              setTrackingModalOrder(order);
                              setTrackingForm({
                                courier: order.courier || 'BlueDart',
                                trackingNumber: order.trackingNumber || '',
                                estimatedDelivery: order.estimatedDelivery || ''
                              });
                            }}
                            className="flex items-center gap-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{order.trackingNumber ? `Track: ${order.trackingNumber}` : 'Assign Courier / Tracking'}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <select
                              disabled={updatingId === order.id}
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="bg-gray-50 border border-gray-300 text-xs rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Items & Shipping Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                        <div className="lg:col-span-2">
                          <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2.5">Ordered Items ({order.items?.length || 0})</h4>
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-xs border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={item.image || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200'} 
                                    alt={item.title || item.name} 
                                    className="w-10 h-10 object-contain rounded-lg bg-white p-1 border" 
                                  />
                                  <div>
                                    <p className="font-bold text-gray-800">{item.title || item.name}</p>
                                    <p className="text-gray-500">{item.brand} • Qty: {item.quantity} × ₹{item.price}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>

                          {/* Tracking badge if assigned */}
                          {order.trackingNumber && (
                            <div className="mt-3 bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-blue-700" />
                                <span>Dispatched via <strong>{order.courier || 'Courier'}</strong> • Tracking ID: <strong className="font-mono">{order.trackingNumber}</strong></span>
                              </div>
                              <span className="text-blue-700 font-semibold">Est: {order.estimatedDelivery}</span>
                            </div>
                          )}
                        </div>

                        {/* Customer Address & Summary */}
                        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wider mb-2">Delivery Destination</h4>
                            <p className="font-bold text-gray-900 text-sm">{order.shippingAddress?.fullName}</p>
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-700" />
                              {order.shippingAddress?.phone}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-emerald-700 mt-0.5 shrink-0" />
                              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-600">Total Charged:</span>
                            <span className="text-lg font-black text-emerald-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* APPOINTMENTS TAB CONTENT */}
            {/* ========================================================= */}
            {activeTab === 'appointments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredAppointments.length === 0 ? (
                  <div className="col-span-full bg-white p-14 text-center rounded-2xl border border-gray-200 text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700 text-base">No appointments found</p>
                    <p className="text-xs text-gray-400 mt-1">Bookings will appear here when patients schedule a doctor consultation.</p>
                  </div>
                ) : (
                  filteredAppointments.map((appt) => (
                    <div key={appt.id || appt._id} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-md transition">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-mono">
                              {appt.id}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg mt-2">{appt.patientName}</h3>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {appt.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-gray-600 my-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span><strong>Doctor:</strong> {appt.doctorName} ({appt.doctorHospital})</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span><strong>Slot:</strong> {appt.date} at <strong>{appt.slot}</strong></span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span><strong>Contact:</strong> {appt.patientPhone} {appt.patientEmail && `(${appt.patientEmail})`}</span>
                          </p>
                          {appt.symptoms && (
                            <p className="text-gray-600 pt-2 border-t border-gray-200">
                              <strong>Symptoms:</strong> {appt.symptoms}
                            </p>
                          )}
                          {appt.adminNotes && (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                              <strong>Clinical Notes:</strong> {appt.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 gap-2">
                        <span className="text-xs font-bold text-gray-700">Fee: ₹{appt.fee}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setNotesModalAppt(appt);
                              setNotesText(appt.adminNotes || '');
                            }}
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Notes
                          </button>
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateAppointmentStatus(appt.id, 'Completed')}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                          >
                            Complete
                          </button>
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateAppointmentStatus(appt.id, 'Cancelled')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* PRODUCT INVENTORY TAB CONTENT */}
            {/* ========================================================= */}
            {activeTab === 'products' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((prod) => {
                    const currentStock = prod.stock !== undefined ? prod.stock : (prod.inStock ? 50 : 0);
                    const isLowStock = currentStock <= 10 && currentStock > 0;
                    const isOutOfStock = currentStock === 0 || prod.inStock === false;

                    return (
                      <div key={prod.id || prod._id} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 flex flex-col justify-between hover:shadow-md transition">
                        <div>
                          <div className="relative">
                            <img 
                              src={prod.image || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400'} 
                              alt={prod.title || prod.name} 
                              className="w-full h-40 object-contain bg-gray-50 rounded-xl p-2 mb-3 border border-gray-100" 
                            />
                            {isOutOfStock ? (
                              <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                                OUT OF STOCK
                              </span>
                            ) : isLowStock ? (
                              <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow animate-pulse">
                                LOW STOCK ({currentStock})
                              </span>
                            ) : null}
                          </div>

                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                            {prod.category}
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 mt-1.5 line-clamp-1">{prod.title || prod.name}</h4>
                          <p className="text-xs text-gray-500 font-semibold">{prod.brand || 'Ayurveda Arogya'}</p>
                          
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-base font-extrabold text-emerald-900">₹{prod.price}</span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-xs text-gray-400 line-through">₹{prod.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        {/* Stock Counter and Action Controls */}
                        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">Stock Count:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickStockUpdate(prod, -5)}
                                title="Decrease by 5"
                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center text-xs"
                              >
                                -5
                              </button>
                              <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                isOutOfStock ? 'bg-red-100 text-red-800' :
                                isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {currentStock}
                              </span>
                              <button
                                onClick={() => handleQuickStockUpdate(prod, 10)}
                                title="Increase by 10"
                                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center text-xs"
                              >
                                +10
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold py-1.5 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => openBatchModal(prod)}
                              className="flex-1 flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold py-1.5 rounded-lg transition"
                              title="Manage Price Batches"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Batches
                            </button>
                            <button
                              onClick={() => setDeleteConfirmProduct(prod)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-serif">
                  {editingProduct ? 'Edit Product Item' : 'Add New Ayurvedic Product'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Fill in details for customer catalog & inventory</p>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ashwagandha Gold Vitality Capsules"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="Herbal Supplements">Herbal Supplements</option>
                    <option value="Immunity & Vitality">Immunity & Vitality</option>
                    <option value="Ayurvedic Oils & Churna">Ayurvedic Oils & Churna</option>
                    <option value="Skin & Hair Care">Skin & Hair Care</option>
                    <option value="Digestive Health">Digestive Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="Ayurveda Arogya"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="499"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="699"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe herbal benefits, doshas balanced, and quality guarantees..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* COURIER & TRACKING MODAL */}
      {/* ========================================================= */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">Delivery Tracking</h3>
                <p className="text-xs text-gray-500 mt-0.5">Order: {trackingModalOrder.id}</p>
              </div>
              <button 
                onClick={() => setTrackingModalOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="mt-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Courier Partner</label>
                <select
                  value={trackingForm.courier}
                  onChange={(e) => setTrackingForm({ ...trackingForm, courier: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  <option value="BlueDart">BlueDart Express</option>
                  <option value="Delhivery">Delhivery Logistics</option>
                  <option value="DTDC">DTDC Courier</option>
                  <option value="India Post">India Post Speed Post</option>
                  <option value="Ecom Express">Ecom Express</option>
                  <option value="Shadowfax">Shadowfax</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">AWB / Tracking Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BD739281920IN"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="text"
                  placeholder="e.g. Fri, Aug 22"
                  value={trackingForm.estimatedDelivery}
                  onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg"
                >
                  {actionLoading ? 'Saving...' : 'Update Tracking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* APPOINTMENT NOTES MODAL */}
      {/* ========================================================= */}
      {notesModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">Consultation Notes</h3>
                <p className="text-xs text-gray-500 mt-0.5">Patient: {notesModalAppt.patientName} ({notesModalAppt.id})</p>
              </div>
              <button 
                onClick={() => setNotesModalAppt(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApptNotes} className="mt-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Doctor Prescription & Clinical Summary</label>
                <textarea
                  rows={5}
                  placeholder="Enter medical findings, recommended Ayurvedic herbs, dosage or follow-up schedule..."
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setNotesModalAppt(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg"
                >
                  {actionLoading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to remove <strong>"{deleteConfirmProduct.title || deleteConfirmProduct.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={actionLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-lg"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MANAGE BATCHES MODAL */}
      {/* ========================================================= */}
      {batchModalProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-[#152420]">Manage Price Batches</h2>
                <p className="text-xs text-gray-500 mt-0.5">{batchModalProduct.title}</p>
              </div>
              <button
                onClick={() => setBatchModalProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Existing Batches */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  Existing Batches
                </h3>
                {!productBatches ? (
                  <div className="h-12 bg-gray-100 animate-pulse rounded-xl" />
                ) : (
                  <div className="space-y-2">
                    {/* Active Batch */}
                    {productBatches.activeBatch ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs">
                        <div>
                          <span className="font-bold text-emerald-800">{productBatches.activeBatch.batchNumber}</span>
                          <span className="ml-2 bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">ACTIVE</span>
                          <p className="text-gray-600 mt-0.5">₹{productBatches.activeBatch.sellingPrice} / unit • Stock: {productBatches.activeBatch.remainingStock}</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No active batch yet</p>
                    )}

                    {/* Old Batches */}
                    {productBatches.oldBatches?.map((batch, i) => (
                      <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs border ${
                        batch.remainingStock === 0
                          ? 'bg-gray-50 border-gray-200 text-gray-400'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        <div>
                          <span className="font-bold">{batch.batchNumber}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            batch.remainingStock === 0
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-amber-200 text-amber-800'
                          }`}>
                            {batch.remainingStock === 0 ? 'EMPTY' : 'OLD LOT'}
                          </span>
                          <p className="mt-0.5">₹{batch.sellingPrice} / unit • Stock: {batch.remainingStock} / {batch.totalStock}</p>
                        </div>
                        <PackageOpen className="w-4 h-4" />
                      </div>
                    ))}

                    {/* Bulk Split Rule */}
                    {productBatches.bulkSplitRule && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800">
                        <span className="font-bold">Bulk Split Rule:</span> Orders of {productBatches.bulkSplitRule.minBulkQty}+ units →{' '}
                        {Math.round(productBatches.bulkSplitRule.oldBatchRatio * 100)}% old lot +{' '}
                        {Math.round(productBatches.bulkSplitRule.newBatchRatio * 100)}% new lot
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add New Batch Form */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Add New Price Batch</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">New Selling Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      value={batchForm.sellingPrice}
                      onChange={e => setBatchForm(f => ({ ...f, sellingPrice: e.target.value }))}
                      placeholder="e.g. 429"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Cost Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={batchForm.costPrice}
                      onChange={e => setBatchForm(f => ({ ...f, costPrice: e.target.value }))}
                      placeholder="Internal cost (optional)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">New Stock Units *</label>
                    <input
                      type="number"
                      min="1"
                      value={batchForm.totalStock}
                      onChange={e => setBatchForm(f => ({ ...f, totalStock: e.target.value }))}
                      placeholder="e.g. 70"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={batchForm.purchaseDate}
                      onChange={e => setBatchForm(f => ({ ...f, purchaseDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Expiry Date (optional)</label>
                    <input
                      type="date"
                      value={batchForm.expiryDate}
                      onChange={e => setBatchForm(f => ({ ...f, expiryDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Notes</label>
                    <input
                      type="text"
                      value={batchForm.notes}
                      onChange={e => setBatchForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Market rate change, new vendor…"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                {/* What will happen notice */}
                {batchForm.sellingPrice && productBatches?.activeBatch && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                    <strong>What happens:</strong> Current batch ({productBatches.activeBatch.batchNumber} @ ₹{productBatches.activeBatch.sellingPrice}) becomes an Old Lot.
                    New batch at <strong>₹{batchForm.sellingPrice}</strong> with <strong>{batchForm.totalStock || '?'} units</strong> becomes active.
                    Product listing price updates to ₹{batchForm.sellingPrice}.
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setBatchModalProduct(null)}
                    className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBatch}
                    disabled={actionLoading || !batchForm.sellingPrice || !batchForm.totalStock}
                    className="flex-1 px-4 py-2.5 bg-[#152420] hover:bg-[#1b2f28] text-white text-xs font-bold rounded-xl transition shadow-lg disabled:opacity-50"
                  >
                    {actionLoading ? 'Adding Batch...' : '+ Add New Batch'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
