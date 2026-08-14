require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Order = require('../models/Order');
const seedData = require('../data/seedData');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayurveda_arogya';

async function seed() {
  try {
    console.log(`🌱 Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected.');

    // 1. Seed Products
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(seedData.products);
    console.log(`🌿 Seeded ${insertedProducts.length} Ayurvedic products.`);

    // 2. Seed Admin User
    await User.deleteMany({ email: 'admin@ayurveda.com' });
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@ayurveda.com',
      password: 'adminpassword123',
      role: 'admin'
    });
    console.log(`🛡️ Seeded Admin user (${adminUser.email}).`);

    // 3. Seed Appointments
    await Appointment.deleteMany({});
    const appt = await Appointment.create({
      id: 'APT-1001',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma',
      doctorHospital: 'National Institute of Ayurveda, Jaipur',
      patientName: 'Nishant Kumar',
      patientPhone: '+91 98765 43210',
      patientEmail: 'patient@example.com',
      date: '2026-08-20',
      slot: '11:30 AM',
      symptoms: 'Acid reflux and digestive health checkup',
      fee: 500,
      status: 'Confirmed'
    });
    console.log(`🩺 Seeded sample appointment (${appt.id}).`);

    // 4. Seed sample Order
    await Order.deleteMany({});
    const sampleOrder = await Order.create({
      id: 'ORD-100852',
      items: [
        {
          id: '6878de00543518a1a1606b08',
          title: 'ABHA GUGGULU | 60 TAB',
          price: 150,
          quantity: 2,
          image: '/assets/iqkgtttwyi7hddjqvcuw.webp',
          brand: 'DHOOTPAPESHWAR'
        }
      ],
      shippingAddress: {
        fullName: 'Nishant Kumar',
        phone: '+91 98765 43210',
        email: 'patient@example.com',
        street: '42 MG Road, Sector 14',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      },
      paymentMethod: 'UPI / Online',
      totalAmount: 300,
      discountAmount: 0,
      paymentStatus: 'Paid',
      orderStatus: 'Processing',
      estimatedDelivery: 'Mon, Aug 24'
    });
    console.log(`📦 Seeded sample order (${sampleOrder.id}).`);

    console.log('🎉 Full MongoDB database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
