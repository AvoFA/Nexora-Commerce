const express = require('express');
const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = requireRole('admin');

router.route('/')
  .get(getBrands)
  .post(authenticateToken, adminOnly, createBrand);

router.route('/:id')
  .put(authenticateToken, adminOnly, updateBrand)
  .delete(authenticateToken, adminOnly, deleteBrand);

module.exports = router;
