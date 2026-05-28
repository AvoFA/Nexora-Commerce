// server/routes/products.js
const express = require('express');
const {
  getProducts,
  getProductById,
  getSimilarProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts
} = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = requireRole('admin');

router.route('/')
  .get(getProducts)
  .post(authenticateToken, adminOnly, createProduct);

router.get('/:id/similar', getSimilarProducts);

router.post('/import', authenticateToken, adminOnly, importProducts);

router.route('/:id')
  .get(getProductById)
  .put(authenticateToken, adminOnly, updateProduct)
  .delete(authenticateToken, adminOnly, deleteProduct);

module.exports = router;
