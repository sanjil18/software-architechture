backend/src/server.js
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const connectDB        = require('./config/database');
const errorHandler     = require('./middleware/errorHandler');
const authRoutes       = require('./routes/authRoutes');
const fineRoutes       = require('./routes/fineRoutes');
const categoryRoutes   = require('./routes/categoryRoutes');

const app = express();
connectDB();

const limiter = rateLimit({ windowMs: 15*60*1000, max: 200 });

app.use(cors({ origin:'*', methods:['GET','POST','PUT','DELETE','PATCH'] }));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));
app.use(morgan('dev'));
app.use('/api', limiter);

app.get('/health', (req, res) => res.json({
  success: true, message:'Sri Lanka Traffic Fine System API running',
  portals:{ payment:'http://localhost:5000/', admin:'http://localhost:5000/admin' }
}));

app.use('/api/auth',       authRoutes);
app.use('/api/fines',      fineRoutes);
app.use('/api/categories', categoryRoutes);

const buildPath = path.join(__dirname, '../../frontend/build');
app.use('/admin', express.static(buildPath));
app.get('/admin/*', (req, res) => res.sendFile(path.join(buildPath,'index.html')));
app.use('/', express.static(buildPath));
app.get('*', (req, res) => res.sendFile(path.join(buildPath,'index.html')));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Payment Portal: http://localhost:${PORT}/`);
  console.log(`📍 Admin Portal:   http://localhost:${PORT}/admin`);
  console.log(`📍 API:            http://localhost:${PORT}/api`);
  console.log(`📍 Health:         http://localhost:${PORT}/health\n`);
});

module.exports = app;