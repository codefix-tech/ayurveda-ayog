const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  phone: { type: String },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ['login', 'register', 'verification'], default: 'login' },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // Auto-deletes when expired in MongoDB
}, {
  timestamps: true
});

module.exports = mongoose.model('OTP', otpSchema);
