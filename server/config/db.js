const mongoose = require('mongoose');

let isMongoConnected = false;

const autoSeedMongo = async () => {
  try {
    const Product = require('../models/Product');
    const User = require('../models/User');
    const Appointment = require('../models/Appointment');
    const Order = require('../models/Order');
    const seedData = require('../data/seedData');

    // 1. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(seedData.products);
      console.log(`🌿 MongoDB: Auto-seeded ${seedData.products.length} Ayurvedic products.`);
    }

    // 2. Ensure Admin User exists
    const adminUser = await User.findOne({ email: 'admin@ayurveda.com' });
    if (!adminUser) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@ayurveda.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('🛡️ MongoDB: Super Admin account initialized (admin@ayurveda.com).');
    }

    // 3. Seed initial consultation appointment if empty
    const apptCount = await Appointment.countDocuments();
    if (apptCount === 0) {
      await Appointment.create({
        id: 'APT-1001',
        doctorId: 'doc-1',
        doctorName: 'Dr. Ananya Sharma',
        doctorHospital: 'National Institute of Ayurveda, Jaipur',
        patientName: 'Nishant Kumar',
        patientPhone: '+91 98765 43210',
        patientEmail: 'patient@example.com',
        date: '2026-08-20',
        slot: '11:30 AM',
        symptoms: 'Digestive issues and wellness checkup',
        fee: 500,
        status: 'Confirmed'
      });
      console.log('🩺 MongoDB: Initial doctor appointment initialized.');
    }
  } catch (err) {
    console.error('MongoDB auto-seed error:', err.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayurveda_arogya';
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Quick timeout if no local mongo daemon
    });
    isMongoConnected = true;
    console.log(`🍃 Production Database Connected: MongoDB Atlas / Local MongoDB`);
    
    // Auto-seed required collections if they don't exist
    await autoSeedMongo();
  } catch (err) {
    isMongoConnected = false;
    console.log(`💡 MongoDB not running on local port. Using File-based Database persistence layer.`);
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = { connectDB, getMongoStatus };
