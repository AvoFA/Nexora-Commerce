// server/routes/activityLogs.js
const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = requireRole('admin');

router.get('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { actionType, targetModel, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (actionType && actionType !== 'all') {
      query.actionType = actionType;
    }
    if (targetModel && targetModel !== 'all') {
      query.targetModel = targetModel;
    }

    // Дати для фільтрації
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Пошук за логами (користувач або текст опису)
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: cleanSearch, $options: 'i' } },
          { email: { $regex: cleanSearch, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { description: { $regex: cleanSearch, $options: 'i' } },
        { user: { $in: userIds } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const [logs, total, countsArray] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .populate('user', 'username email role')
        .lean(),
      ActivityLog.countDocuments(query),
      ActivityLog.aggregate([
        { $group: { _id: "$actionType", count: { $sum: 1 } } }
      ])
    ]);

    const counts = { all: await ActivityLog.countDocuments() };
    countsArray.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json({
      success: true,
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      counts
    });
  } catch (error) {
    console.error('Помилка отримання журналу аудиту:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання журналу аудиту'
    });
  }
});

module.exports = router;
