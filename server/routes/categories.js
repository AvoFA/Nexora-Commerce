const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = requireRole('admin');

router.route('/')
  .get(getCategories)
  .post(authenticateToken, adminOnly, createCategory);

router.route('/:id')
  .put(authenticateToken, adminOnly, updateCategory)
  .delete(authenticateToken, adminOnly, deleteCategory);

module.exports = router;
