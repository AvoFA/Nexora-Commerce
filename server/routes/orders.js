const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

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

    if (customer.phone) {
      await User.findByIdAndUpdate(req.user.id, { phone: customer.phone.trim() });
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

router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Помилка отримання замовлень (адмін):', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання замовлень'
    });
  }
});

router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'packing', 'ready_for_pickup', 'received', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Недопустимий статус' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Замовлення не знайдено' });
    }

    order.status = status;
    order.history.push({ status, timestamp: new Date() });
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
