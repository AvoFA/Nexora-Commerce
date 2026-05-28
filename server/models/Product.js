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
  compareAtPrice: {
    type: Number,
    default: null,
    min: 0,
    validate: {
      validator(value) {
        const price = typeof this.get === 'function' ? this.get('price') : this.price;
        return value == null || price == null || value > price;
      },
      message: 'Compare-at price must be greater than product price'
    }
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
