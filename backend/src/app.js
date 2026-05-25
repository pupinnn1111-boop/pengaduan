require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { connectDB } = require('./config/database');
require('./models'); // Load semua model + asosiasi

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const commentRoutes = require('./routes/commentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// GLOBAL MIDDLEWARE
// ========================
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads sebagai static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================
// ROUTES
// ========================
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/laporan', laporanRoutes);
app.use('/comments', commentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Sistem Pelaporan Pengaduan Masyarakat API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      categories: '/categories',
      laporan: '/laporan',
      comments: '/comments',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

// ========================
// GLOBAL ERROR HANDLER
// ========================
app.use(errorHandler);

// ========================
// START SERVER
// ========================
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📂 Uploads tersedia di http://localhost:${PORT}/uploads`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();

module.exports = app;
