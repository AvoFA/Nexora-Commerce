const mongoose = require('mongoose');

const wishlistListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function() {
      return this.role === 'admin';
    },
    unique: true,
    sparse: true,
    minlength: [3, 'Імʼя користувача має бути мінімум 3 символи'],
    maxlength: [50, 'Імʼя користувача має бути максимум 50 символів']
  },
  email: {
    type: String,
    required: function() {
      return this.role === 'user';
    },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: function() {
      return this.role === 'user';
    },
    minlength: [2, 'Імʼя має бути мінімум 2 символи'],
    maxlength: [100, 'Імʼя має бути максимум 100 символів'],
    trim: true
  },
  surname: {
    type: String,
    trim: true,
    default: ''
  },
  patronymic: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: [true, 'Пароль обовʼязковий'],
    minlength: [6, 'Пароль має бути мінімум 6 символів']
  },
  wishlistLists: [wishlistListSchema],
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.methods.getPublicData = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
