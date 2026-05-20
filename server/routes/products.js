// server/routes/products.js
const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = requireRole('admin');

router.route('/')
  .get(getProducts)
  .post(authenticateToken, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authenticateToken, adminOnly, updateProduct)
  .delete(authenticateToken, adminOnly, deleteProduct);

module.exports = router;
