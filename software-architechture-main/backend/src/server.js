require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const fineRoutes = require('./routes/fineRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', limiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sri Lanka Traffic Fine System API is running',
    portals: {
      payment: 'http://localhost:5000/',
      admin: 'http://localhost:5000/admin',
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/categories', categoryRoutes);

// ─── Serve Merged Frontend (React) ───────────────────────────────────────────
const frontendBuild = path.join(__dirname, '../../frontend/build');

// Admin portal at /admin/*
app.use('/admin', express.static(frontendBuild));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// Payment portal at /* (root)
app.use('/', express.static(frontendBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// ─────────────────────────────────────────────────────────────────────────────

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Health:         http://localhost:${PORT}/health`);
  console.log(`📍 API:            http://localhost:${PORT}/api`);
  console.log(`📍 Payment Portal: http://localhost:${PORT}/`);
  console.log(`📍 Admin Portal:   http://localhost:${PORT}/admin\n`);
});

module.exports = app;
