const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../db/dbManager');
const { getMongoStatus } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (getMongoStatus()) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (err) {
          console.error('Mongo user lookup error in auth:', err.message);
        }
      }

      if (!req.user) {
        const fileUser = db.findUserById(decoded.id);
        if (fileUser) {
          const { password, ...userWithoutPassword } = fileUser;
          req.user = userWithoutPassword;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Protect middleware error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please login again' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware that populates req.user if token is present, but allows request to proceed if no token (guest mode)
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (getMongoStatus()) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (err) {}
      }

      if (!req.user) {
        const fileUser = db.findUserById(decoded.id);
        if (fileUser) {
          const { password, ...userWithoutPassword } = fileUser;
          req.user = userWithoutPassword;
        }
      }
    } catch (error) {
      // Invalid/expired token in optionalAuth is ignored; req.user remains undefined (guest mode)
    }
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, optionalAuth, admin };
