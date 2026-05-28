const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Question = require('../models/Question');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = requireRole('admin');

const normalizeItems = (items = []) => {
  return items.map((item) => {
    const productId = item.product || item._id || item.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Некоректний товар у замовленні');
    }

    return {
      product: productId,
      name: item.name,
      price: Number(item.price) || 0,
      compareAtPrice: Number(item.compareAtPrice) > Number(item.price)
        ? Number(item.compareAtPrice)
        : null,
      image: item.image || item.imageUrl || '',
      quantity: Number(item.quantity) || 1
    };
  });
};

router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      items,
      customer,
      delivery,
      paymentMethod = 'cash',
      totalPrice,
      comment = ""
    } = req.body;

    const normalizedItems = normalizeItems(items);

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Контактні дані обовʼязкові'
      });
    }

    if (!delivery?.address || !delivery?.city || !delivery?.zip) {
      return res.status(400).json({
        success: false,
        message: 'Дані доставки обовʼязкові'
      });
    }

    const calculatedTotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user.id,
      items: normalizedItems,
      customer,
      delivery,
      paymentMethod,
      totalPrice: Number(totalPrice) || calculatedTotal,
      status: 'new',
      comment: comment.trim(),
      history: [{ status: 'new', timestamp: new Date() }]
    });

    // Sync order contact details back to the user's permanent profile
    const userUpdates = {};
    if (customer.phone) userUpdates.phone = customer.phone.trim();
    if (customer.firstName) userUpdates.name = customer.firstName.trim();
    if (customer.surname) userUpdates.surname = customer.surname.trim();
    if (customer.patronymic) userUpdates.patronymic = customer.patronymic.trim();

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdates);
    }

    res.status(201).json({
      success: true,
      order,
      message: 'Замовлення створено'
    });
  } catch (error) {
    console.error('Помилка створення замовлення:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка створення замовлення'
    });
  }
});

router.get('/my', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Помилка отримання замовлень:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання замовлень'
    });
  }
});

router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Замовлення не знайдено' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Немає доступу до цього замовлення' });
    }

    if (!['new', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Це замовлення вже обробляється або завершене, тому його не можна скасувати.'
      });
    }

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Обовʼязково вкажіть причину скасування' });
    }

    order.status = 'cancelled';
    order.cancellation = {
      cancelledBy: 'customer',
      reason: reason,
      comment: comment || '',
      cancelledAt: new Date()
    };
    order.history.push({
      status: 'cancelled',
      timestamp: new Date(),
      changedBy: 'customer',
      reason: reason,
      comment: comment || ''
    });

    await order.save();

    res.json({
      success: true,
      order,
      message: 'Замовлення успішно скасовано'
    });
  } catch (error) {
    console.error('Помилка скасування замовлення:', error.message);
    res.status(500).json({ success: false, message: 'Помилка скасування замовлення' });
  }
});

router.get('/admin/dashboard-data', authenticateToken, adminOnly, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      ordersTodayCount,
      todayTurnoverAggregation,
      totalTurnoverAggregation,
      newOrdersCount,
      unansweredQuestionsCount,
      pendingReviewsCount,
      lowStockProductsCount,
      recentOrders,
      pendingReviews,
      unansweredQuestions,
      lowStockProducts
    ] = await Promise.all([
      // 1. Stats
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.countDocuments({ status: 'new' }),
      Question.countDocuments({
        $or: [
          { answer: { $exists: false } },
          { answer: '' }
        ]
      }),
      Review.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stock: { $lte: 5 } }),

      // 2. Recent Orders (7)
      Order.find()
        .populate('user', 'name surname patronymic email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // 3. Pending Reviews (5)
      Review.find({ status: 'pending' })
        .populate('product', 'name image')
        .sort({ createdAt: -1 })
        .limit(7)
        .lean(),

      // 4. Unanswered Questions (5)
      Question.find({
        $or: [
          { answer: { $exists: false } },
          { answer: '' }
        ]
      })
        .populate('product', 'name image')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // 5. Low Stock Products (7)
      Product.find({ stock: { $lte: 5 } })
        .sort({ stock: 1, name: 1 })
        .limit(7)
        .lean()
    ]);

    const stats = {
      ordersToday: ordersTodayCount,
      turnoverToday: todayTurnoverAggregation[0]?.total || 0,
      turnoverTotal: totalTurnoverAggregation[0]?.total || 0,
      newOrders: newOrdersCount,
      unansweredQuestions: unansweredQuestionsCount,
      pendingReviews: pendingReviewsCount,
      lowStock: lowStockProductsCount
    };

    res.json({
      success: true,
      stats,
      recentOrders,
      pendingReviews,
      unansweredQuestions,
      lowStockProducts
    });
  } catch (error) {
    console.error('Помилка отримання даних дашборду:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання даних дашборду'
    });
  }
});

router.get('/admin', authenticateToken, adminOnly, async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;
    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;
    const { status, search, cancelledBy, customer } = req.query;
    const query = {};
    const countQuery = {};
    const validCancelledBy = ['customer', 'admin'].includes(cancelledBy) ? cancelledBy : null;

    if (customer && mongoose.Types.ObjectId.isValid(customer)) {
      query.user = new mongoose.Types.ObjectId(customer);
      countQuery.user = new mongoose.Types.ObjectId(customer);
    }

    // 1. Status Filter
    if (status && status !== 'all') {
      if (status === 'processing') {
        query.status = { $in: ['confirmed', 'packing'] };
      } else {
        query.status = status;
      }
    }

    if (validCancelledBy) {
      query.status = 'cancelled';
      query['cancellation.cancelledBy'] = validCancelledBy;
    }

    // 2. Search Filter
    const searchConditions = [];
    if (search && search.trim()) {
      const cleanSearch = search.trim().replace(/^#/, '');
      const searchRegex = new RegExp(cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      searchConditions.push(
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex }
      );

      // Check if it is a valid ObjectId (24 hex characters)
      if (mongoose.Types.ObjectId.isValid(cleanSearch) && cleanSearch.length === 24) {
        searchConditions.push({ _id: new mongoose.Types.ObjectId(cleanSearch) });
      }

      // Fallback partial ObjectId matching using $expr
      searchConditions.push({
        $expr: {
          $regexMatch: {
            input: { $toString: '$_id' },
            regex: cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            options: 'i'
          }
        }
      });

      query.$or = searchConditions;
    }

    // 3. Counts Aggregation (must match search conditions but NOT status and pagination)
    if (searchConditions.length > 0) {
      countQuery.$or = searchConditions;
    }

    const countsAggregation = await Order.aggregate([
      { $match: countQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      all: 0,
      new: 0,
      processing: 0,
      ready_for_pickup: 0,
      received: 0,
      cancelled: 0,
      cancelledCustomer: 0,
      cancelledAdmin: 0
    };

    let totalAll = 0;
    countsAggregation.forEach(c => {
      const s = c._id;
      const count = c.count;
      totalAll += count;

      if (s === 'confirmed' || s === 'packing') {
        counts.processing += count;
      }
      if (counts.hasOwnProperty(s)) {
        counts[s] += count;
      }
    });
    counts.all = totalAll;

    const cancellationCountsAggregation = await Order.aggregate([
      { $match: { ...countQuery, status: 'cancelled' } },
      { $group: { _id: '$cancellation.cancelledBy', count: { $sum: 1 } } }
    ]);

    cancellationCountsAggregation.forEach(c => {
      if (c._id === 'customer') {
        counts.cancelledCustomer = c.count;
      }
      if (c._id === 'admin') {
        counts.cancelledAdmin = c.count;
      }
    });

    // 4. Sorting
    const sortParam = req.query.sort || 'createdAt_desc';
    let sortObj = { createdAt: -1 };
    if (sortParam === 'createdAt_asc') {
      sortObj = { createdAt: 1 };
    } else if (sortParam === 'totalPrice_desc') {
      sortObj = { totalPrice: -1, createdAt: -1 };
    } else if (sortParam === 'totalPrice_asc') {
      sortObj = { totalPrice: 1, createdAt: -1 };
    }

    // 5. Fetch orders and total
    const orders = await Order.find(query)
      .populate('user', 'name surname patronymic email')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts
    });
  } catch (error) {
    console.error('Помилка отримання замовлень (адмін):', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання замовлень'
    });
  }
});

router.patch('/:id/status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'packing', 'ready_for_pickup', 'received', 'cancelled'];
    const allowedTransitionsMap = {
      new: ['confirmed', 'cancelled'],
      confirmed: ['packing', 'cancelled'],
      packing: ['ready_for_pickup', 'cancelled'],
      ready_for_pickup: ['received', 'cancelled'],
      received: [],
      cancelled: []
    };

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Недопустимий статус' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Замовлення не знайдено' });
    }

    if (order.status === status) {
      return res.json({
        success: true,
        order,
        message: 'Статус замовлення не змінено'
      });
    }

    const allowedTransitions = allowedTransitionsMap[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Недопустимий перехід статусу'
      });
    }

    order.status = status;
    const historyEntry = { status, timestamp: new Date() };

    if (status === 'cancelled') {
      if (!order.cancellation || !order.cancellation.cancelledBy) {
        order.cancellation = {
          cancelledBy: 'admin',
          cancelledAt: new Date()
        };
      }
      historyEntry.changedBy = 'admin';
    }

    order.history.push(historyEntry);
    await order.save();

    res.json({
      success: true,
      order,
      message: 'Статус замовлення оновлено'
    });
  } catch (error) {
    console.error('Помилка оновлення статусу замовлення:', error.message);
    res.status(500).json({ success: false, message: 'Помилка оновлення статусу' });
  }
});

module.exports = router;
