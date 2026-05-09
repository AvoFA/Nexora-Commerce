// Роуты для управления wishlist (червоного серця)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для перевірки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Токен відсутній'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-for-course-work', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Невалідний токен'
      });
    }
    req.user = user;
    next();
  });
};

// Додати товар до улюблених
router.post('/add/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    // Перевіряємо чи товар вже в улюблених
    if (user.favorites.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Товар вже в улюблених'
      });
    }

    // Додаємо товар до улюблених
    user.favorites.push(productId);
    await user.save();

    res.json({
      success: true,
      message: 'Товар додано до улюблених',
      favorites: user.favorites
    });

  } catch (error) {
    console.error('Помилка додавання до улюблених:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка додавання товару до улюблених'
    });
  }
});

// Видалити товар з улюблених
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    // Видаляємо товар з улюблених
    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();

    res.json({
      success: true,
      message: 'Товар видалено з улюблених',
      favorites: user.favorites
    });

  } catch (error) {
    console.error('Помилка видалення з улюблених:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення товару з улюблених'
    });
  }
});

// Отримати список улюблених товарів користувача
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('favorites', 'name price image brand category description _id')
      .select('favorites');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    res.json({
      success: true,
      favorites: user.favorites
    });

  } catch (error) {
    console.error('Помилка отримання улюблених товарів:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання улюблених товарів'
    });
  }
});

// Перевірити чи товар в улюблених
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isFavorite = user.favorites.includes(productId);

    res.json({
      success: true,
      isFavorite
    });

  } catch (error) {
    console.error('Помилка перевірки улюблених:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка перевірки статусу товару'
    });
  }
});

// Очистити всі улюблені
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    // Очищаємо всі улюблені для цього користувача
    user.favorites = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Улюблені успішно очищено'
    });
  } catch (error) {
    console.error('Помилка при очищенні улюблених:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при очищенні улюблених'
    });
  }
});

module.exports = router;
