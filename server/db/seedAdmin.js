require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayurveda_arogya';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    const adminEmail = 'admin@ayurveda.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated user role to admin.');
      }
    } else {
      const adminUser = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password: adminpassword123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
