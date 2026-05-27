// Category controller

const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});

    // Add product count to each category
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat.name });
      return {
        ...cat.toObject(),
        count
      };
    }));

    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create a category
const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Category deleted successfully'
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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
