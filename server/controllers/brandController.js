// server/controllers/brandController.js
const Brand = require('../models/Brand');

// Отримати всі бренди
const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ name: 1 });

    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Створити новий бренд
const createBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    // Якщо бренд вже існує (duplicate key error)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Brand already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// Оновити бренд
const updateBrand = async (req, res) => {
  try {
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: brand,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// Видалити бренд
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    await brand.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
};
