const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'new',
  'confirmed',
  'packing',
  'ready_for_pickup',
  'received',
  'cancelled'
];

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
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
    min: 0
  },
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator(items) {
        return items.length > 0;
      },
      message: 'Замовлення має містити хоча б один товар'
    }
  },
  customer: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true }
  },
  delivery: {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    deliveryPrice: { type: Number, default: 0, min: 0 }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    default: 'cash'
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'new'
  },
  cancellation: {
    cancelledBy: { type: String, enum: ['customer', 'admin'] },
    reason: { type: String },
    comment: { type: String },
    cancelledAt: { type: Date }
  },
  history: [{
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changedBy: { type: String, enum: ['customer', 'admin', 'system'] },
    reason: { type: String },
    comment: { type: String }
  }]
}, {
  timestamps: true
});

orderSchema.pre('save', function(next) {
  if (this.isNew && this.history.length === 0) {
    this.history.push({ status: this.status || 'new', timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
