const mongoose = require('mongoose');

const QUESTION_STATUSES = ['pending', 'approved', 'rejected'];

const questionSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: QUESTION_STATUSES,
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
module.exports.QUESTION_STATUSES = QUESTION_STATUSES;
