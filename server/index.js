require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectDB, getMongoStatus } = require('./config/db');

const productRoutes = require('./routes/products');
const appointmentRoutes = require('./routes/appointments');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const batchRoutes = require('./routes/batches');

// ── Fail fast if JWT_SECRET is not set ──
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5005;

// Connect Database
connectDB();

// ── Security Middleware ──
// Helmet: adds security HTTP headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving static assets cross-origin
  contentSecurityPolicy: false // Disable CSP for dev; enable with proper policy in production
}));

// CORS: restrict to allowed origins only
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:5005',
  'http://127.0.0.1:5005'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    console.error(`[CORS Blocked] Origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting: prevent brute-force and API abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login/register attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// Body parsing with size limits to prevent payload attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static asset images
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Register API Routes
app.use('/api', productRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', batchRoutes);

// Health check endpoint with DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Ayurveda Arogya Backend API',
    database: getMongoStatus() ? 'MongoDB' : 'Persistent File DB',
    razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Test Mode (keys not set)',
    time: new Date().toISOString()
  });
});

// ── Production: Serve built React client ──
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // SPA catch-all: any non-API route returns the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ── Global Error Handler ──
// Must be defined AFTER all routes (4-arg signature tells Express this is an error handler)
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.stack || err.message || err);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🌿 Ayurveda Arogya Production Backend Server running on http://localhost:${PORT}`);
});
