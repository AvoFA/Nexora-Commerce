const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'Category' // String identifier for the icon (e.g., 'Smartphone', 'Laptop')
  },
  image: {
    type: String,
    default: '' // Необязательно, будет пустая строка если нет фото
  },
  color: {
    type: String,
    default: 'linear-gradient(135deg, #3A86FF, #214D8A)'
  },
  defaultAttributes: [{
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
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
