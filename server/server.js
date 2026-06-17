// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');

// Import routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const questionRoutes = require('./routes/questions');
const deliveryRoutes = require('./routes/delivery');
const customerRoutes = require('./routes/customers');

const app = express();

const TECHNICAL_ERROR_PATTERNS = [
  'E11000',
  'duplicate key',
  'MongoServerError',
  'ValidationError',
  'validation failed',
  'Cast to',
  'ObjectId',
  'username_1'
];

const sanitizePublicErrorText = (value) => {
  if (typeof value !== 'string') return value;

  if (!TECHNICAL_ERROR_PATTERNS.some((pattern) => value.includes(pattern))) {
    return value;
  }

  if (value.includes('E11000') || value.includes('duplicate key') || value.includes('username_1')) {
    return 'Запис з такими даними вже існує.';
  }

  return 'Помилка сервера. Спробуйте пізніше.';
};

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const json = res.json.bind(res);

  res.json = (body) => {
    if (body && typeof body === 'object' && body.success === false) {
      return json({
        ...body,
        message: sanitizePublicErrorText(body.message),
        error: sanitizePublicErrorText(body.error)
      });
    }

    return json(body);
  };

  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/activity-logs', require('./routes/activityLogs'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'EShop Admin API is running!',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      product: '/api/products/:id'
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin')
  .then(async () => {
    console.log('✅ MongoDB connected');

    try {
      await User.collection.dropIndex('username_1');
    } catch (error) {
      if (error.codeName !== 'IndexNotFound') {
        console.warn('Could not drop username_1 index:', error.message);
      }
    }

    await User.syncIndexes();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}`);
});

module.exports = app;
