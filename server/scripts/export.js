// server/scripts/export.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const User = require('../models/User');

const DATA_DIR = path.join(__dirname, '../data');

async function exportData() {
  try {
    // Connect to database using configuration URL
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create target directory if it does not exist
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Export Categories
    const categories = await Category.find({}).lean();
    fs.writeFileSync(
      path.join(DATA_DIR, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    console.log(`✅ Exported ${categories.length} categories to categories.json`);

    // Export Brands
    const brands = await Brand.find({}).lean();
    fs.writeFileSync(
      path.join(DATA_DIR, 'brands.json'),
      JSON.stringify(brands, null, 2)
    );
    console.log(`✅ Exported ${brands.length} brands to brands.json`);

    // Export Products
    const products = await Product.find({}).lean();
    fs.writeFileSync(
      path.join(DATA_DIR, 'products.json'),
      JSON.stringify(products, null, 2)
    );
    console.log(`✅ Exported ${products.length} products to products.json`);

    // Export Users
    const users = await User.find({}).lean();
    fs.writeFileSync(
      path.join(DATA_DIR, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`✅ Exported ${users.length} users to users.json`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

exportData();
