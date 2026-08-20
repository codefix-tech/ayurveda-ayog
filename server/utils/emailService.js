const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');
const db = require('../db/dbManager');
const { getMongoStatus } = require('../config/db');

// Create Nodemailer Transporter for SMTP
function getTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host) { console.warn('⚠️ [EMAIL] EMAIL_HOST not set in .env'); return null; }
  if (!user) { console.warn('⚠️ [EMAIL] EMAIL_USER not set in .env'); return null; }
  if (!pass) { console.warn('⚠️ [EMAIL] EMAIL_PASS not set in .env — email sending disabled'); return null; }

  console.log(`✅ [EMAIL] SMTP configured: ${host}:${port} as ${user}`);

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10) || 587,
    secure: parseInt(port, 10) === 465,
    auth: { user, pass }
  });
}

/**
 * Generate 6-digit OTP string
 */
function generate6DigitOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send 6-digit OTP via Gmail SMTP with branded HTML template
 */
async function sendEmailOtp({ email, purpose = 'login' }) {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    throw new Error('Please provide a valid email address');
  }

  const otpCode = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // 1. Save in MongoDB
  try {
    if (getMongoStatus()) {
      await OTP.deleteMany({ email: normalizedEmail });
      const otpDoc = new OTP({
        email: normalizedEmail,
        otp: otpCode,
        purpose,
        expiresAt
      });
      await otpDoc.save();
    }
  } catch (err) {
    console.error('Mongo Email OTP save error:', err.message);
  }

  // 2. Save in File DB fallback
  db.saveOtp(normalizedEmail, otpCode, purpose, expiresAt);

  // 3. Dispatch Live Email if Gmail credentials configured
  const transporter = getTransporter();
  let emailSent = false;

  if (transporter) {
    try {
      const subject = purpose === 'register' 
        ? `🌿 Verify your Ayurveda Arogya Account: ${otpCode}` 
        : `🌿 Your Ayurveda Arogya Login OTP: ${otpCode}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 20px; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e0ebe4; }
            .header { background: #152420; padding: 32px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; }
            .header p { margin: 6px 0 0 0; font-size: 13px; color: #a3c9b9; }
            .content { padding: 36px 30px; text-align: center; }
            .badge { display: inline-block; background: #eef7f2; color: #1c523e; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
            .title { font-size: 20px; font-weight: 700; color: #1a2e26; margin-bottom: 8px; }
            .desc { font-size: 14px; color: #5a7369; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #f0f7f3; border: 2px dashed #2d6a4f; border-radius: 16px; padding: 18px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #152420; margin: 20px 0; font-family: monospace; }
            .expiry { font-size: 12px; color: #829a90; margin-top: 14px; }
            .footer { background: #fafcfa; border-top: 1px solid #e8f0ec; padding: 20px; text-align: center; font-size: 11px; color: #889e95; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌿 Ayurveda Arogya</h1>
              <p>Natural Healing & Authentic Ayurvedic Care</p>
            </div>
            <div class="content">
              <span class="badge">Verification Required</span>
              <h2 class="title">${purpose === 'register' ? 'Confirm Your Email Address' : 'Sign in to Your Account'}</h2>
              <p class="desc">Please use the 6-digit verification code below to verify your email address and continue.</p>
              
              <div class="otp-box">${otpCode}</div>
              
              <p class="expiry">⏰ This code will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p><strong>Ayurveda Arogya</strong><br>
              82/3, First Floor, Patel Nagar, Saharanpur Road, Dehradun, Uttarakhand - 248001<br>
              Contact: +91-8171117711 | info@ayurvedarogya.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Ayurveda Arogya" <info@ayurvedarogya.com>',
        to: normalizedEmail,
        subject,
        html: htmlContent
      });

      emailSent = true;
      console.log(`✉️ [SMTP] OTP Email successfully dispatched to ${normalizedEmail}`);
    } catch (mailErr) {
      console.error('Nodemailer send error:', mailErr.message);
    }
  }

  // Always log to server terminal for development reference
  console.log(`\n======================================================`);
  console.log(`🌿 [AYURVEDA AROGYA SMTP/EMAIL OTP DISPATCH]`);
  console.log(`📧 Destination Email : ${normalizedEmail}`);
  console.log(`🔑 Verification OTP  : ${otpCode}`);
  console.log(`⏰ Validity          : 5 Minutes (Expires at ${expiresAt.toLocaleTimeString()})`);
  console.log(`🎯 Purpose           : ${purpose.toUpperCase()}`);
  console.log(`📡 SMTP Status       : ${emailSent ? '✅ SENT VIA SMTP' : '⚠️ DEV SIMULATION (Set EMAIL_PASS in .env for live SMTP)'}`);
  console.log(`======================================================\n`);

  return {
    email: normalizedEmail,
    expiresInSeconds: 300,
    emailSent,
    devOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode
  };
}

/**
 * Verify provided OTP against stored record
 */
async function verifyEmailOtp({ email, otp }) {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const inputOtp = (otp || '').trim();

  if (!normalizedEmail || !inputOtp) {
    return { valid: false, message: 'Email address and 6-digit OTP code are required.' };
  }

  // Try MongoDB
  try {
    if (getMongoStatus()) {
      const record = await OTP.findOne({ email: normalizedEmail });
      if (record) {
        if (new Date() > new Date(record.expiresAt)) {
          await OTP.deleteOne({ _id: record._id });
          return { valid: false, message: 'OTP has expired. Please request a new code.' };
        }
        if (record.otp === inputOtp) {
          // Success! Consume OTP
          await OTP.deleteOne({ _id: record._id });
          db.deleteOtp(normalizedEmail);
          return { valid: true };
        } else {
          return { valid: false, message: 'Incorrect OTP entered. Please check and retry.' };
        }
      }
    }
  } catch (err) {
    console.error('Mongo verify OTP error:', err.message);
  }

  // File DB fallback
  const fileRecord = db.getOtp(normalizedEmail);
  if (!fileRecord) {
    return { valid: false, message: 'No active OTP found or code expired. Please request a new one.' };
  }

  if (fileRecord.otp === inputOtp) {
    db.deleteOtp(normalizedEmail);
    return { valid: true };
  }

  return { valid: false, message: 'Incorrect OTP entered. Please check and retry.' };
}

/**
 * Send appointment booking confirmation email to patient
 */
async function sendAppointmentConfirmation(appointment) {
  const { patientName, patientEmail, doctorName, doctorHospital, date, slot, id, fee, symptoms } = appointment;

  if (!patientEmail || !patientEmail.includes('@')) {
    console.log(`ℹ️ [EMAIL] Skipping confirmation — no patient email provided for appointment ${id}`);
    return { sent: false, reason: 'No patient email' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`⚠️ [EMAIL] Appointment confirmation NOT sent — SMTP not configured`);
    return { sent: false, reason: 'SMTP not configured' };
  }

  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e0ebe4; }
        .header { background: #152420; padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; }
        .header p { margin: 0; font-size: 13px; color: #a3c9b9; }
        .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 50px; margin: 20px 0 10px; }
        .content { padding: 10px 30px 30px; text-align: center; }
        .title { font-size: 22px; font-weight: 800; color: #1a2e26; margin-bottom: 6px; }
        .subtitle { font-size: 13px; color: #5a7369; margin-bottom: 24px; }
        .details-box { background: #f0f7f3; border-radius: 16px; padding: 20px 24px; text-align: left; margin: 16px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d4edda; font-size: 13px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #5a7369; font-weight: 600; }
        .detail-value { color: #152420; font-weight: 700; text-align: right; max-width: 55%; }
        .apt-id { font-family: monospace; font-size: 15px; font-weight: 800; color: #1c523e; background: #d1fae5; padding: 4px 12px; border-radius: 8px; display: inline-block; margin: 10px 0 20px; }
        .note { font-size: 12px; color: #829a90; line-height: 1.6; margin-top: 16px; padding: 12px; background: #fafcfa; border-radius: 10px; }
        .footer { background: #fafcfa; border-top: 1px solid #e8f0ec; padding: 20px; text-align: center; font-size: 11px; color: #889e95; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 Ayurveda Arogya</h1>
          <p>Natural Healing & Authentic Ayurvedic Care</p>
        </div>
        <div class="content">
          <span class="badge">✅ Appointment Confirmed</span>
          <h2 class="title">Your Consultation is Booked!</h2>
          <p class="subtitle">Dear ${patientName}, your appointment has been successfully confirmed. Below are your booking details.</p>
          
          <p style="font-size:12px;color:#829a90;margin-bottom:4px;">Appointment ID</p>
          <div class="apt-id">${id}</div>

          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">👨‍⚕️ Doctor</span>
              <span class="detail-value">${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🏥 Hospital</span>
              <span class="detail-value">${doctorHospital}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Date</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏰ Time Slot</span>
              <span class="detail-value">${slot}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💰 Consultation Fee</span>
              <span class="detail-value">₹${fee}</span>
            </div>
            ${symptoms ? `<div class="detail-row"><span class="detail-label">📝 Symptoms</span><span class="detail-value">${symptoms}</span></div>` : ''}
          </div>

          <div class="note">
            📌 Please arrive 10 minutes before your appointment time. Carry any previous medical reports or prescriptions for reference. For cancellations or rescheduling, please contact us at <strong>+91-8171117711</strong>.
          </div>
        </div>
        <div class="footer">
          <p><strong>Ayurveda Arogya</strong><br>
          82/3, First Floor, Patel Nagar, Saharanpur Road, Dehradun, Uttarakhand - 248001<br>
          Contact: +91-8171117711 | info@ayurvedarogya.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Ayurveda Arogya" <info@ayurvedarogya.com>',
      to: patientEmail,
      subject: `✅ Appointment Confirmed — ${doctorName} on ${formattedDate} at ${slot}`,
      html: htmlContent
    });
    console.log(`✉️ [EMAIL] Appointment confirmation sent to ${patientEmail} for ${id}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ [EMAIL] Appointment confirmation failed for ${patientEmail}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = {
  sendEmailOtp,
  verifyEmailOtp,
  generate6DigitOtp,
  sendAppointmentConfirmation
};
