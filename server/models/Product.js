// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  image: String,
  category: {
    type: String,
    default: 'phones'
  },
  brand: {
    type: String,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  attributes: [{
    groupName: {
      type: String,
      required: true,
      trim: true
    },
    items: [{
      key: {
        type: String,
        required: true,
        trim: true
      },
      value: {
        type: String,
        default: ''
      }
    }]
  }]
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
