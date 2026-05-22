const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOrModerator = requireRole('admin', 'moderator');

// GET /api/customers/stats - Get customer workspace stats
router.get('/stats', authenticateToken, adminOrModerator, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // 2. New today
    const newToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfToday }
    });

    // 3. Loyal customers (>= 3 orders)
    const loyalCustomersAgg = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 3 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.role': 'user'
        }
      },
      {
        $count: 'total'
      }
    ]);
    const loyalCustomers = loyalCustomersAgg[0]?.total || 0;

    // 4. Active buyers (>= 1 order in last 30 days)
    const activeBuyersAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$user'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.role': 'user'
        }
      },
      {
        $count: 'total'
      }
    ]);
    const activeBuyers = activeBuyersAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalCustomers,
        newToday,
        activeBuyers,
        loyalCustomers
      }
    });
  } catch (error) {
    console.error('Помилка отримання статистики клієнтів:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання статистики клієнтів'
    });
  }
});

// GET /api/customers - Get paginated & filtered list of customers
router.get('/', authenticateToken, adminOrModerator, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    const matchStage = { role: 'user' };

    if (status) {
      matchStage.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchStage.$or = [
        { name: searchRegex },
        { surname: searchRegex },
        { patronymic: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Get total matching count
    const totalCustomers = await User.countDocuments(matchStage);
    const totalPages = Math.ceil(totalCustomers / limit);

    // Sorting definition
    let sortStage = {};
    if (sortBy === 'totalSpent') {
      sortStage = { totalSpent: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'ordersCount') {
      sortStage = { ordersCount: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'lastOrderDate') {
      sortStage = { lastOrderDate: sortOrder === 'desc' ? -1 : 1 };
    } else {
      sortStage = { createdAt: sortOrder === 'desc' ? -1 : 1 };
    }

    // Main aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          ordersCount: { $size: '$orders' },
          totalSpent: { $sum: '$orders.totalPrice' },
          lastOrderDate: { $max: '$orders.createdAt' },
          avgCheck: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: { $divide: [{ $sum: '$orders.totalPrice' }, { $size: '$orders' }] },
              else: 0
            }
          }
        }
      },
      { $sort: sortStage },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          password: 0,
          wishlistLists: 0,
          orders: 0
        }
      }
    ];

    const customers = await User.aggregate(pipeline);

    res.json({
      success: true,
      customers,
      pagination: {
        totalCustomers,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Помилка отримання списку клієнтів:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання списку клієнтів'
    });
  }
});

// GET /api/customers/:id - Get detailed customer info & order history
router.get('/:id', authenticateToken, adminOrModerator, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Невалідний ID користувача'
      });
    }

    const customer = await User.findOne({ _id: id, role: 'user' }).select('-password -wishlistLists');
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Клієнта не знайдено'
      });
    }

    const orders = await Order.find({ user: id }).sort({ createdAt: -1 });

    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const ordersCount = orders.length;
    const avgCheck = ordersCount > 0 ? totalSpent / ordersCount : 0;
    const lastOrderDate = ordersCount > 0 ? orders[0].createdAt : null;

    res.json({
      success: true,
      customer: {
        ...customer.toObject(),
        totalSpent,
        ordersCount,
        avgCheck,
        lastOrderDate
      },
      orders
    });
  } catch (error) {
    console.error('Помилка отримання деталей клієнта:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання деталей клієнта'
    });
  }
});

// PATCH /api/customers/:id/toggle-block - Toggle block status for a customer
router.patch('/:id/toggle-block', authenticateToken, adminOrModerator, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Невалідний ID користувача'
      });
    }

    const customer = await User.findOne({ _id: id, role: 'user' });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Клієнта не знайдено або цей користувач не є покупцем'
      });
    }

    customer.status = customer.status === 'blocked' ? 'active' : 'blocked';
    await customer.save();

    res.json({
      success: true,
      status: customer.status,
      message: customer.status === 'blocked' ? 'Клієнта успішно заблоковано' : 'Клієнта успішно розблоковано'
    });
  } catch (error) {
    console.error('Помилка зміни статусу клієнта:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка зміни статусу клієнта'
    });
  }
});

module.exports = router;
