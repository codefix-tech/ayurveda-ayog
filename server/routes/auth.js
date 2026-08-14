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
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Input validation
    if (name.length > 100) {
      return res.status(400).json({ message: 'Name too long (max 100 characters)' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: 'Password too long (max 128 characters)' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in Mongo or File DB
    let userExists = false;
    if (getMongoStatus()) {
      try {
        userExists = await User.findOne({ email: normalizedEmail });
      } catch (err) {
        console.error('Mongo user lookup error:', err.message);
      }
    }
    if (!userExists) {
      userExists = db.findUserByEmail(normalizedEmail);
    }

    const userId = `usr-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      id: userId,
      _id: userId,
      name: name.trim().substring(0, 100),
      email: normalizedEmail,
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
