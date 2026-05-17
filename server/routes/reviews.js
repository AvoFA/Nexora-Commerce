const express = require('express');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const { REVIEW_STATUSES } = require('../models/Review');

const router = express.Router();

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

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Доступ заборонено. Потрібні права адміністратора.'
    });
  }
};

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, rating, text, pros, cons } = req.body;

    if (!productId || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Обов\'язкові поля не заповнені'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      name: req.user.name,
      rating: Number(rating),
      text,
      pros,
      cons,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      review,
      message: 'Відгук відправлено на модерацію'
    });
  } catch (error) {
    console.error('Помилка створення відгуку:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка створення відгуку'
    });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Помилка отримання відгуків:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання відгуків'
    });
  }
});

router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name image')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Помилка отримання відгуків (адмін):', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання відгуків'
    });
  }
});

router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Недопустимий статус'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Відгук не знайдено'
      });
    }

    res.json({
      success: true,
      review,
      message: 'Статус відгуку оновлено'
    });
  } catch (error) {
    console.error('Помилка оновлення статусу:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка оновлення статусу'
    });
  }
});

module.exports = router;
