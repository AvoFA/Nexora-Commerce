// Product controller

const Product = require('../models/Product');
const recommendationService = require('../services/recommendations/similarProductsService');

// ... (rest of imports)
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get similar products for recommendations
const getSimilarProducts = async (req, res) => {
  try {
    const similar = await recommendationService.getSimilarProducts(req.params.id);

    res.json({
      success: true,
      data: similar
    });
  } catch (error) {
    const status = error.message === 'Product not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      const safeSearch = escapeRegExp(search.trim());
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let products;
    let total;

    if (search) {
      // Fetch all matching products to perform a relevance sort in memory
      const allMatchingProducts = await Product.find(query).sort({ createdAt: -1 });
      total = allMatchingProducts.length;

      const safeSearchLower = search.trim().toLowerCase();
      
      // Sort matching products: Name matches first, then description matches
      allMatchingProducts.sort((a, b) => {
        const aNameContains = a.name && a.name.toLowerCase().includes(safeSearchLower);
        const bNameContains = b.name && b.name.toLowerCase().includes(safeSearchLower);

        if (aNameContains && !bNameContains) return -1;
        if (!aNameContains && bNameContains) return 1;

        if (aNameContains && bNameContains) {
          const aStartsWith = a.name.toLowerCase().startsWith(safeSearchLower);
          const bStartsWith = b.name.toLowerCase().startsWith(safeSearchLower);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
        }
        return 0;
      });

      products = allMatchingProducts.slice(skip, skip + limit);
    } else {
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
      total = await Product.countDocuments(query);
    }

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create a product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: error.message
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const importProducts = async (req, res) => {
  try {
    const body = req.body;

    const raw = Array.isArray(body) ? body : [body];

    if (raw.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Список товарів порожній'
      });
    }

    const products = [];
    const errors = [];

    raw.forEach((item, index) => {
      if (!item.name || typeof item.name !== 'string') {
        errors.push(`Товар #${index + 1}: відсутня назва (name)`);
        return;
      }
      const price = parseFloat(item.price);
      if (isNaN(price) || price < 0) {
        errors.push(`Товар #${index + 1} "${item.name}": невірна ціна (price)`);
        return;
      }

      products.push({
        name: String(item.name).trim(),
        price,
        stock: parseInt(item.stock) || 0,
        description: item.description ? String(item.description).trim() : '',
        image: item.image || '',
        category: item.category || 'phones',
        brand: item.brand ? String(item.brand).trim() : '',
        isFeatured: Boolean(item.isFeatured),
        attributes: Array.isArray(item.attributes) ? item.attributes : [],
      });
    });

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Немає валідних товарів для імпорту',
        errors
      });
    }

    const inserted = await Product.insertMany(products, { ordered: false });

    res.status(201).json({
      success: true,
      message: `Успішно імпортовано ${inserted.length} товарів`,
      count: inserted.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Помилка імпорту',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getSimilarProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts
};
