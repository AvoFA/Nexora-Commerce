const express = require('express');
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const { QUESTION_STATUSES } = require('../models/Question');

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

// 1. Створення нового питання користувачем
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, text } = req.body;

    if (!productId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Обов\'язкові поля не заповнені'
      });
    }

    const question = await Question.create({
      user: req.user.id,
      product: productId,
      name: req.user.name,
      text: text.trim(),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      question,
      message: 'Запитання відправлено на модерацію'
    });
  } catch (error) {
    console.error('Помилка створення запитання:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка створення запитання'
    });
  }
});

// 2. Отримання запитань поточного користувача
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user.id })
      .populate('product', 'name image category brand')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Помилка отримання запитань користувача:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання запитань користувача'
    });
  }
});

// 3. Отримання схвалених запитань для картки товару
router.get('/product/:productId', async (req, res) => {
  try {
    const questions = await Question.find({
      product: req.params.productId,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Помилка отримання запитань товару:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання запитань товару'
    });
  }
});

// 4. Отримання списку запитань для адмін-панелі
router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    const { status, answerStatus, sort, search } = req.query;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;
    const query = {};

    // Фільтр за статусом
    if (status && status !== 'all') {
      query.status = status;
    }

    // Фільтр за наявністю відповіді
    if (answerStatus === 'answered') {
      query.answer = { $exists: true, $ne: '' };
    } else if (answerStatus === 'unanswered') {
      query.$or = [
        { answer: { $exists: false } },
        { answer: '' }
      ];
    }

    // Пошук за текстом запитання/відповіді, автором та назвою товару
    if (search && search.trim()) {
      const cleanSearch = search.trim().slice(0, 100);
      const searchRegex = new RegExp(cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const User = require('../models/User');
      const Product = require('../models/Product');

      const [matchingUsers, matchingProducts] = await Promise.all([
        User.find({
          $or: [
            { name: searchRegex },
            { email: searchRegex }
          ]
        }).select('_id').lean(),
        Product.find({
          name: searchRegex
        }).select('_id').lean()
      ]);

      const userIds = matchingUsers.map(u => u._id);
      const productIds = matchingProducts.map(p => p._id);

      query.$or = [
        { name: searchRegex },
        { text: searchRegex },
        { answer: searchRegex },
        { user: { $in: userIds } },
        { product: { $in: productIds } }
      ];
    }

    // Підрахунок кількості за статусами (для плашок зверху)
    // Має враховувати пошук та фільтр за відповідями, але не статус
    const countQuery = {};
    if (answerStatus === 'answered') {
      countQuery.answer = { $exists: true, $ne: '' };
    } else if (answerStatus === 'unanswered') {
      countQuery.$or = [
        { answer: { $exists: false } },
        { answer: '' }
      ];
    }
    if (query.$or) {
      countQuery.$or = query.$or;
    }

    const countsAggregation = await Question.aggregate([
      { $match: countQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      all: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    let totalAll = 0;
    countsAggregation.forEach(c => {
      const s = c._id;
      const count = c.count;
      totalAll += count;
      if (counts.hasOwnProperty(s)) {
        counts[s] = count;
      }
    });
    counts.all = totalAll;

    // Окремо рахуємо загальну кількість питань без відповіді (для плашки статистики)
    const unansweredCount = await Question.countDocuments({
      $or: [
        { answer: { $exists: false } },
        { answer: '' }
      ]
    });

    // Сортування
    let sortObj = { createdAt: -1 };
    if (sort === 'createdAt_asc') {
      sortObj = { createdAt: 1 };
    }

    // Запит
    const questions = await Question.find(query)
      .populate('product', 'name image')
      .populate('user', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts,
      unansweredCount
    });
  } catch (error) {
    console.error('Помилка отримання запитань (адмін):', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання запитань'
    });
  }
});

// 5. Оновлення статусу запитання (адмін)
router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!QUESTION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Недопустимий статус'
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Запитання не знайдено'
      });
    }

    res.json({
      success: true,
      question,
      message: 'Статус запитання оновлено'
    });
  } catch (error) {
    console.error('Помилка оновлення статусу запитання:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка оновлення статусу запитання'
    });
  }
});

// 6. Додавання або оновлення відповіді адміністратора
// Автоматично затверджує запитання (status = 'approved')
router.patch('/:id/answer', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Текст відповіді обов\'язковий'
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        answer: answer.trim(),
        status: 'approved' // Автоматично затверджуємо при відповіді
      },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Запитання не знайдено'
      });
    }

    res.json({
      success: true,
      question,
      message: 'Відповідь опубліковано'
    });
  } catch (error) {
    console.error('Помилка додавання відповіді:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка додавання відповіді'
    });
  }
});

// 7. Видалення запитання (адмін)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Запитання не знайдено'
      });
    }

    res.json({
      success: true,
      message: 'Запитання успішно видалено'
    });
  } catch (error) {
    console.error('Помилка видалення запитання:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення запитання'
    });
  }
});

module.exports = router;
