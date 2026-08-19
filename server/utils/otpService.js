const OTP = require('../models/OTP');
const db = require('../db/dbManager');
const { getMongoStatus } = require('../config/db');

/**
 * Generate a random 6-digit OTP string
 */
function generate6DigitOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Clean phone number to 10 digits
 */
function normalizePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.slice(-10);
}

/**
 * Send OTP via SMS / WhatsApp gateway (and console logger for development)
 */
async function sendOtp({ phone, purpose = 'login' }) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 10 || !['6', '7', '8', '9'].includes(cleanPhone[0])) {
    throw new Error('Please provide a valid 10-digit Indian mobile number');
  }

  const otpCode = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // 1. Persist in MongoDB
  try {
    if (getMongoStatus()) {
      // Remove any existing OTP for this phone number
      await OTP.deleteMany({ phone: cleanPhone });
      const otpDoc = new OTP({
        phone: cleanPhone,
        otp: otpCode,
        purpose,
        expiresAt
      });
      await otpDoc.save();
    }
  } catch (err) {
    console.error('Mongo OTP save error:', err.message);
  }

  // 2. Persist in File DB
  db.saveOtp(cleanPhone, otpCode, purpose, expiresAt);

  // 3. Dispatch Notification / SMS Gateway
  console.log(`\n======================================================`);
  console.log(`🌿 [AYURVEDA AROGYA SMS/WHATSAPP GATEWAY]`);
  console.log(`📱 Destination Phone : +91 ${cleanPhone}`);
  console.log(`🔑 Verification OTP  : ${otpCode}`);
  console.log(`⏰ Validity          : 5 Minutes (Expires at ${expiresAt.toLocaleTimeString()})`);
  console.log(`🎯 Purpose           : ${purpose.toUpperCase()}`);
  console.log(`======================================================\n`);

  return {
    phone: cleanPhone,
    expiresInSeconds: 300,
    devOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode
  };
}

/**
 * Verify provided OTP against stored record
 */
async function verifyOtp({ phone, otp }) {
  const cleanPhone = normalizePhone(phone);
  const inputOtp = (otp || '').trim();

  if (!cleanPhone || !inputOtp) {
    return { valid: false, message: 'Phone number and 6-digit OTP are required.' };
  }

  // Try MongoDB
  try {
    if (getMongoStatus()) {
      const record = await OTP.findOne({ phone: cleanPhone });
      if (record) {
        if (new Date() > new Date(record.expiresAt)) {
          await OTP.deleteOne({ _id: record._id });
          return { valid: false, message: 'OTP has expired. Please request a new code.' };
        }
        if (record.otp === inputOtp) {
          // Success! Consume OTP
          await OTP.deleteOne({ _id: record._id });
          db.deleteOtp(cleanPhone);
          return { valid: true };
        } else {
          return { valid: false, message: 'Incorrect OTP entered. Please try again.' };
        }
      }
    }
  } catch (err) {
    console.error('Mongo verify OTP error:', err.message);
  }

  // File DB fallback
  const fileRecord = db.getOtp(cleanPhone);
  if (!fileRecord) {
    return { valid: false, message: 'No active OTP found or code expired. Please request a new one.' };
  }

  if (fileRecord.otp === inputOtp) {
    db.deleteOtp(cleanPhone);
    return { valid: true };
  }

  return { valid: false, message: 'Incorrect OTP entered. Please check and retry.' };
}

module.exports = {
  generate6DigitOtp,
  normalizePhone,
  sendOtp,
  verifyOtp
};
