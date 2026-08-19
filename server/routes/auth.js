const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const db = require('../db/dbManager');
const { getMongoStatus } = require('../config/db');
const { protect } = require('../middleware/auth');

// Generate JWT — NO fallback secret
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    // Input validation: Name
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }
    if (trimmedName.length > 100) {
      return res.status(400).json({ message: 'Name cannot exceed 100 characters' });
    }

    // Input validation: Strict Email Format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address (e.g. name@domain.com)' });
    }

    // Input validation: Indian Mobile Phone Number (if provided)
    let cleanedPhone = '';
    if (phone && phone.trim()) {
      cleanedPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
      const phoneRegex = /^(?:(?:\+|00)91)?([6-9]\d{9})$/;
      if (!phoneRegex.test(cleanedPhone)) {
        return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9' });
      }
    }

    // Input validation: Password
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: 'Password cannot exceed 128 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email or phone already registered
    let userExists = false;
    if (getMongoStatus()) {
      try {
        const query = [{ email: normalizedEmail }];
        if (cleanedPhone) query.push({ phone: cleanedPhone });
        userExists = await User.findOne({ $or: query });
      } catch (err) {
        console.error('Mongo user lookup error:', err.message);
      }
    }
    if (!userExists) {
      userExists = db.findUserByEmail(normalizedEmail);
    }

    if (userExists) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please login instead.' });
    }

    const userId = `usr-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      id: userId,
      _id: userId,
      name: trimmedName.substring(0, 100),
      email: normalizedEmail,
      phone: cleanedPhone || '',
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // Save to Mongo if available
    if (getMongoStatus()) {
      try {
        const newUser = await User.create({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: password, // Mongoose pre-save hook handles hashing
          role: 'user'
        });
        userData._id = newUser._id;
        userData.id = newUser._id;
      } catch (mongoErr) {
        console.error('Mongo register save error:', mongoErr.message);
      }
    }

    // Save to File DB
    db.saveUser(userData);

    res.status(201).json({
      _id: userData._id || userData.id,
      id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      token: generateToken(userData._id || userData.id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate a user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try MongoDB first if connected
    if (getMongoStatus()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && (await user.matchPassword(password))) {
          return res.json({
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
          });
        }
      } catch (err) {
        console.error('Mongo login lookup error:', err.message);
      }
    }

    // Check in File DB fallback
    const fileUser = db.findUserByEmail(normalizedEmail);
    if (fileUser && (await bcrypt.compare(password, fileUser.password))) {
      return res.json({
        _id: fileUser._id || fileUser.id,
        id: fileUser.id || fileUser._id,
        name: fileUser.name,
        email: fileUser.email,
        role: fileUser.role,
        token: generateToken(fileUser._id || fileUser.id),
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server Error during login' });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send 6-digit OTP to user's Email / Gmail inbox
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'login' } = req.body;
    const emailService = require('../utils/emailService');

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address (e.g. name@domain.com)' 
      });
    }

    // Check if account exists
    let existingUser = null;
    if (getMongoStatus()) {
      try {
        existingUser = await User.findOne({ email: normalizedEmail });
      } catch (err) {
        console.error('Mongo email check error:', err.message);
      }
    }
    if (!existingUser) {
      existingUser = db.findUserByEmail(normalizedEmail);
    }

    const result = await emailService.sendEmailOtp({ email: normalizedEmail, purpose });

    res.json({
      success: true,
      message: `OTP sent successfully to ${normalizedEmail}`,
      email: normalizedEmail,
      userExists: !!existingUser,
      emailSent: result.emailSent,
      expiresInSeconds: result.expiresInSeconds,
      devOtp: result.devOtp
    });
  } catch (error) {
    console.error('Send OTP error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify Email OTP for Instant Login or Registration
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name, phone, purpose = 'login' } = req.body;
    const emailService = require('../utils/emailService');

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Both email address and OTP code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const verification = await emailService.verifyEmailOtp({ email: normalizedEmail, otp });

    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // OTP is valid! Find existing user
    let user = null;
    if (getMongoStatus()) {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (err) {
        console.error('Mongo user email lookup error:', err.message);
      }
    }
    if (!user) {
      user = db.findUserByEmail(normalizedEmail);
    }

    // If user exists, log them in immediately
    if (user) {
      return res.json({
        success: true,
        message: 'Email verification successful! Logged in.',
        _id: user._id || user.id,
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        token: generateToken(user._id || user.id)
      });
    }

    // If user does NOT exist, create new user account
    const trimmedName = (name || 'Ayurveda Member').trim();
    const cleanPhone = (phone || '').trim().replace(/\D/g, '');
    const userId = `usr-${Date.now()}`;
    const randomPassword = `OTP-Pass-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUserData = {
      id: userId,
      _id: userId,
      name: trimmedName.substring(0, 100),
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    if (getMongoStatus()) {
      try {
        const createdMongoUser = await User.create({
          name: newUserData.name,
          email: newUserData.email,
          phone: cleanPhone,
          password: randomPassword,
          role: 'user'
        });
        newUserData._id = createdMongoUser._id;
        newUserData.id = createdMongoUser._id;
      } catch (err) {
        console.error('Mongo user register with email OTP error:', err.message);
      }
    }

    db.saveUser(newUserData);

    return res.status(201).json({
      success: true,
      message: 'Account created and verified successfully via Email OTP!',
      _id: newUserData._id || newUserData.id,
      id: newUserData.id || newUserData._id,
      name: newUserData.name,
      email: newUserData.email,
      phone: newUserData.phone,
      role: newUserData.role,
      token: generateToken(newUserData._id || newUserData.id)
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user data
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
