const mongoose = require('mongoose');

const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  pros: {
    type: String,
    trim: true
  },
  cons: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: REVIEW_STATUSES,
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
module.exports.REVIEW_STATUSES = REVIEW_STATUSES;
