const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const seedData = require('../data/seedData');

const DB_DIR = path.join(__dirname, 'data');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper to read JSON file or return default
function readJson(filename, defaultValue) {
  const filePath = path.join(DB_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      writeJson(filename, defaultValue);
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

// Helper to write JSON file
function writeJson(filename, data) {
  const filePath = path.join(DB_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
}

// Initialize seed DB files if missing
function initDb() {
  readJson('products.json', seedData.products);
  readJson('categories.json', seedData.categories);
  readJson('brands.json', seedData.brands);
  readJson('doctors.json', seedData.doctors);
  readJson('appointments.json', [
    {
      id: "APT-1001",
      doctorId: "doc-1",
      doctorName: "Dr. Ananya Sharma",
      doctorHospital: "National Institute of Ayurveda, Jaipur",
      patientName: "Nishant Kumar",
      patientPhone: "+91 98765 43210",
      patientEmail: "patient@example.com",
      date: "2026-08-20",
      slot: "11:30 AM",
      symptoms: "Acid reflux and digestive issues",
      fee: 500,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    }
  ]);
  readJson('orders.json', []);

  // Pre-seed default Admin in users.json
  const defaultPasswordHash = bcrypt.hashSync('adminpassword123', 10);
  const users = readJson('users.json', [
    {
      id: 'admin-1',
      _id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@ayurveda.com',
      password: defaultPasswordHash,
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ]);

  // Ensure admin always exists in users
  if (!users.some(u => u.email === 'admin@ayurveda.com')) {
    users.push({
      id: 'admin-1',
      _id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@ayurveda.com',
      password: defaultPasswordHash,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    writeJson('users.json', users);
  }
}

initDb();

module.exports = {
  getProducts: () => readJson('products.json', seedData.products),
  getCategories: () => readJson('categories.json', seedData.categories),
  getBrands: () => readJson('brands.json', seedData.brands),
  getDoctors: () => readJson('doctors.json', seedData.doctors),

  getAppointments: () => readJson('appointments.json', []),
  saveAppointment: (appointment) => {
    const appointments = readJson('appointments.json', []);
    appointments.push(appointment);
    writeJson('appointments.json', appointments);
    return appointment;
  },
  updateAppointmentStatus: (id, status) => {
    const appointments = readJson('appointments.json', []);
    const index = appointments.findIndex(a => a.id === id || a._id === id);
    if (index !== -1) {
      appointments[index].status = status;
      writeJson('appointments.json', appointments);
      return appointments[index];
    }
    return null;
  },

  getOrders: () => readJson('orders.json', []),
  saveOrder: (order) => {
    const orders = readJson('orders.json', []);
    orders.push(order);
    writeJson('orders.json', orders);
    return order;
  },
  updateOrderStatus: (id, orderStatus) => {
    const orders = readJson('orders.json', []);
    const index = orders.findIndex(o => o.id === id || o._id === id);
    if (index !== -1) {
      orders[index].orderStatus = orderStatus;
      writeJson('orders.json', orders);
      return orders[index];
    }
    return null;
  },

  // Product Management
  saveProduct: (product) => {
    const products = readJson('products.json', seedData.products);
    products.unshift(product);
    writeJson('products.json', products);
    return product;
  },
  updateProduct: (id, updateData) => {
    const products = readJson('products.json', seedData.products);
    const index = products.findIndex(p => p.id === id || p._id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData };
      writeJson('products.json', products);
      return products[index];
    }
    return null;
  },
  deleteProduct: (id) => {
    let products = readJson('products.json', seedData.products);
    const initialLen = products.length;
    products = products.filter(p => p.id !== id && p._id !== id);
    writeJson('products.json', products);
    return products.length < initialLen;
  },

  // Appointment notes update
  updateAppointmentNotes: (id, adminNotes) => {
    const appointments = readJson('appointments.json', []);
    const index = appointments.findIndex(a => a.id === id || a._id === id);
    if (index !== -1) {
      appointments[index].adminNotes = adminNotes;
      writeJson('appointments.json', appointments);
      return appointments[index];
    }
    return null;
  },

  // Order Tracking update
  updateOrderTracking: (id, { trackingNumber, courier }) => {
    const orders = readJson('orders.json', []);
    const index = orders.findIndex(o => o.id === id || o._id === id);
    if (index !== -1) {
      if (trackingNumber !== undefined) orders[index].trackingNumber = trackingNumber;
      if (courier !== undefined) orders[index].courier = courier;
      writeJson('orders.json', orders);
      return orders[index];
    }
    return null;
  },

  // Users management
  getUsers: () => readJson('users.json', []),
  findUserByEmail: (email) => {
    const users = readJson('users.json', []);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserByPhone: (phone) => {
    const users = readJson('users.json', []);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return users.find(u => u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
  },
  findUserById: (id) => {
    const users = readJson('users.json', []);
    return users.find(u => u.id === id || u._id === id);
  },
  saveUser: (user) => {
    const users = readJson('users.json', []);
    users.push(user);
    writeJson('users.json', users);
    return user;
  },

  // OTP Storage Fallback (Supports Email and Phone)
  saveOtp: (identifier, otp, purpose = 'login', expiresAt) => {
    let otps = readJson('otps.json', []);
    const cleanId = (identifier || '').toLowerCase().trim();
    // Remove existing OTPs for this identifier
    otps = otps.filter(o => o.identifier !== cleanId);
    const newOtp = { identifier: cleanId, otp, purpose, expiresAt: expiresAt.toISOString() };
    otps.push(newOtp);
    writeJson('otps.json', otps);
    return newOtp;
  },
  getOtp: (identifier) => {
    const otps = readJson('otps.json', []);
    const cleanId = (identifier || '').toLowerCase().trim();
    const found = otps.find(o => o.identifier === cleanId);
    if (!found) return null;
    if (new Date(found.expiresAt) < new Date()) {
      // Expired
      return null;
    }
    return found;
  },
  deleteOtp: (identifier) => {
    let otps = readJson('otps.json', []);
    const cleanId = (identifier || '').toLowerCase().trim();
    otps = otps.filter(o => o.identifier !== cleanId);
    writeJson('otps.json', otps);
  }
};
