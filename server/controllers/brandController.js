// server/controllers/brandController.js
const Brand = require('../models/Brand');

// Get all brands
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

// Create a brand
const createBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    // Handle duplicate brand name
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

// Update a brand
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

// Delete a brand
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
