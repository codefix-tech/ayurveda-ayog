import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  ShoppingBag, Calendar, Package, RefreshCw, CheckCircle, Clock, 
  XCircle, Truck, Search, Plus, Filter, ChevronRight, User, Phone, MapPin, DollarSign 
} from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'appointments' | 'products'
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

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
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.shippingAddress?.fullName && o.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredProducts = products.filter(p => 
    (p.title || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 font-sans">
      {/* Top Banner */}
      <div className="bg-[#152420] text-white py-10 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
              <span>🛡️ Admin Operations</span>
            </div>
            <h1 className="text-3xl font-extrabold font-serif">Store Management Dashboard</h1>
            <p className="text-emerald-200/80 text-sm mt-1">
              Control client orders, doctor consultations, and medicine inventory in real-time.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="self-start md:self-auto flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-600/40 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Container */}
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
            <span>Product Catalog</span>
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {products.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
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
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-4 font-medium">Fetching dashboard records...</p>
          </div>
        ) : (
          <>
            {/* ORDERS TAB CONTENT */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
                    No orders found matching your search criteria.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id || order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-gray-900 text-lg">{order.id}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                              order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleString('en-IN')} • Payment: <strong className="text-gray-700">{order.paymentStatus}</strong> ({order.paymentMethod})
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-gray-600">Update Status:</label>
                          <select
                            disabled={updatingId === order.id}
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items & Shipping */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="md:col-span-2">
                          <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-xs">
                                <div className="flex items-center gap-3">
                                  <img src={item.image} alt={item.title || item.name} className="w-10 h-10 object-contain rounded bg-white p-1 border" />
                                  <div>
                                    <p className="font-bold text-gray-800">{item.title || item.name}</p>
                                    <p className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wider mb-2">Shipping Details</h4>
                            <p className="font-bold text-gray-900 text-sm">{order.shippingAddress?.fullName}</p>
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-700" />
                              {order.shippingAddress?.phone}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
                              <MapPin className="w-3 h-3 text-emerald-700 mt-0.5 shrink-0" />
                              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-600">Total Amount:</span>
                            <span className="text-lg font-black text-emerald-900">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* APPOINTMENTS TAB CONTENT */}
            {activeTab === 'appointments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAppointments.length === 0 ? (
                  <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
                    No appointments booked yet.
                  </div>
                ) : (
                  filteredAppointments.map((appt) => (
                    <div key={appt.id || appt._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              {appt.id}
                            </span>
                            <h3 className="font-bold text-gray-900 text-base mt-2">{appt.patientName}</h3>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {appt.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-gray-600 my-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <strong>Doctor:</strong> {appt.doctorName} ({appt.doctorHospital})
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <strong>Date & Slot:</strong> {appt.date} at {appt.slot}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <strong>Contact:</strong> {appt.patientPhone} {appt.patientEmail && `(${appt.patientEmail})`}
                          </p>
                          {appt.symptoms && (
                            <p className="text-gray-500 pt-1 border-t border-gray-200">
                              <strong>Symptoms:</strong> {appt.symptoms}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-700">Fee: ₹{appt.fee}</span>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateAppointmentStatus(appt.id, 'Completed')}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                          >
                            Mark Completed
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

            {/* PRODUCTS TAB CONTENT */}
            {activeTab === 'products' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((prod) => (
                    <div key={prod.id || prod._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
                      <div>
                        <img src={prod.image} alt={prod.title || prod.name} className="w-full h-36 object-contain bg-gray-50 rounded-xl p-2 mb-3" />
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 mt-1 line-clamp-1">{prod.title || prod.name}</h4>
                        <p className="text-xs text-gray-500 font-semibold">{prod.brand}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400 line-through mr-1">₹{prod.originalPrice}</span>
                          <span className="text-base font-extrabold text-emerald-900">₹{prod.price}</span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                          In Stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
