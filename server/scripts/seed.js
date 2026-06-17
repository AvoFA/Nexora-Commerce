// server/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const User = require('../models/User');
const UserController = require('../controllers/userController');

const DATA_DIR = path.join(__dirname, '../data');

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';
    console.log(`Connecting to database to seed: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. Seed Categories
    const categoriesFile = path.join(DATA_DIR, 'categories.json');
    if (fs.existsSync(categoriesFile)) {
      const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
      await Category.deleteMany({});
      await Category.insertMany(categories);
      console.log(`✅ Loaded ${categories.length} categories to database`);
    } else {
      console.warn('⚠️ categories.json not found, skipping');
    }

    // 2. Seed Brands
    const brandsFile = path.join(DATA_DIR, 'brands.json');
    if (fs.existsSync(brandsFile)) {
      const brands = JSON.parse(fs.readFileSync(brandsFile, 'utf8'));
      await Brand.deleteMany({});
      await Brand.insertMany(brands);
      console.log(`✅ Loaded ${brands.length} brands to database`);
    } else {
      console.warn('⚠️ brands.json not found, skipping');
    }

    // 3. Seed Products
    const productsFile = path.join(DATA_DIR, 'products.json');
    if (fs.existsSync(productsFile)) {
      const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      await Product.deleteMany({});
      await Product.insertMany(products);
      console.log(`✅ Loaded ${products.length} products to database`);
    } else {
      console.warn('⚠️ products.json not found, skipping');
    }

    // 4. Seed Users (Admin, Moderator, Clients)
    const usersFile = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      await User.deleteMany({});
      await User.insertMany(users);
      console.log(`✅ Loaded ${users.length} users (including admin/moderators) to database`);
    } else {
      console.log('⚠️ users.json not found, creating default admin user from environment variables');
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      await User.deleteMany({ role: 'admin' });
      await UserController.createUser(adminUsername, adminPassword, 'admin');
      console.log(`✅ Created default admin user: "${adminUsername}"`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedData();
