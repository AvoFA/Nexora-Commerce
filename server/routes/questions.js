const express = require('express');
const Question = require('../models/Question');
const { QUESTION_STATUSES } = require('../models/Question');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const moderationAccess = requireRole('admin', 'moderator');

// 1. Create a new question by a user
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

// 2. Get questions of the current user
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

// 3. Get approved questions for a product page
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

// 4. Get questions for admin panel
router.get('/admin', authenticateToken, moderationAccess, async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    const { status, answerStatus, sort, search } = req.query;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;
    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by answer status
    if (answerStatus === 'answered') {
      query.answer = { $exists: true, $ne: '' };
    } else if (answerStatus === 'unanswered') {
      query.$or = [
        { answer: { $exists: false } },
        { answer: '' }
      ];
    }

    // Search by question/answer text, author name/email, and product name
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

    // Count by status for UI stats badges
    // Should respect search and answer filters, but ignore status
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

    // Count total unanswered questions for the stats badge
    const unansweredCount = await Question.countDocuments({
      $or: [
        { answer: { $exists: false } },
        { answer: '' }
      ]
    });

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'createdAt_asc') {
      sortObj = { createdAt: 1 };
    }

    // Query database
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

// 5. Update question status (admin/moderator)
router.patch('/:id/status', authenticateToken, moderationAccess, async (req, res) => {
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

// 6. Add or update admin reply
// Automatically approves question on reply
router.patch('/:id/answer', authenticateToken, moderationAccess, async (req, res) => {
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
        status: 'approved' // Automatically approve on reply
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

// 7. Delete question (admin/moderator)
router.delete('/:id', authenticateToken, moderationAccess, async (req, res) => {
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
