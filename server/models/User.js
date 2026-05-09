// Модель для відображення користувачів у базі даних
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function() {
      return this.role === 'admin'; // username обов'язкова тільки для адмінів
    },
    unique: true,
    sparse: true, // Дозволяє null значення для клієнтів
    minlength: [3, 'Ім\'я користувача має бути мінімум 3 символи'],
    maxlength: [50, 'Ім\'я користувача має бути максимум 50 символів']
  },
  email: {
    type: String,
    required: function() {
      return this.role === 'user'; // email обов'язкова для клієнтів
    },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: function() {
      return this.role === 'user'; // ім'я обов'язкове для клієнтів
    },
    minlength: [2, 'Ім\'я має бути мінімум 2 символи'],
    maxlength: [100, 'Ім\'я має бути максимум 100 символів'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Пароль обов\'язковий'],
    minlength: [6, 'Пароль має бути мінімум 6 символів']
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' // Список улюблених товарів для клієнтів
  }],
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user' // Типово всі нові користувачі - клієнти
  }
}, {
  timestamps: true
});



// Метод порівняння паролів
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Метод отримання публічних даних
userSchema.methods.getPublicData = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
