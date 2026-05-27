const express = require('express');
const Review = require('../models/Review');
const { REVIEW_STATUSES } = require('../models/Review');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const moderationAccess = requireRole('admin', 'moderator');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, rating, text, pros, cons } = req.body;

    if (!productId || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Обов\'язкові поля не заповнені'
      });
    }

    // Check if this user already reviewed this product
    const existingReview = await Review.findOne({ user: req.user.id, product: productId });

    if (existingReview) {
      if (existingReview.status === 'pending' || existingReview.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Ви вже залишили відгук на цей товар'
        });
      }
      
      // Allow updating a rejected review instead of creating a new one
      if (existingReview.status === 'rejected') {
        existingReview.rating = Number(rating);
        existingReview.text = text;
        existingReview.pros = pros;
        existingReview.cons = cons;
        existingReview.status = 'pending'; // Submit back to moderation
        existingReview.name = req.user.name;
        
        await existingReview.save();

        return res.status(200).json({
          success: true,
          review: existingReview,
          message: 'Відгук оновлено та відправлено на модерацію'
        });
      }
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

// Get all reviews of the current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name image category brand')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Помилка отримання відгуків користувача:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання відгуків користувача'
    });
  }
});

// Get current user's review for a specific product
router.get('/me/product/:productId', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({ 
      user: req.user.id, 
      product: req.params.productId 
    });

    res.json({
      success: true,
      review // null if not found
    });
  } catch (error) {
    console.error('Помилка отримання відгуку користувача:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання відгуку користувача'
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

router.get('/admin', authenticateToken, moderationAccess, async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    const { status, rating, sort, search } = req.query;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;
    const query = {};

    // 1. Status Filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // 2. Rating Filter
    if (rating && rating !== 'all') {
      const ratingNum = parseInt(rating, 10);
      if (!isNaN(ratingNum)) {
        query.rating = ratingNum;
      }
    }

    // 3. Sanitized and Capped Search Filter
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
        { pros: searchRegex },
        { cons: searchRegex },
        { user: { $in: userIds } },
        { product: { $in: productIds } }
      ];
    }

    // 4. Counts Aggregation (must match search & rating filter but NOT status)
    const countQuery = {};
    if (rating && rating !== 'all') {
      const ratingNum = parseInt(rating, 10);
      if (!isNaN(ratingNum)) {
        countQuery.rating = ratingNum;
      }
    }
    if (query.$or) {
      countQuery.$or = query.$or;
    }

    const countsAggregation = await Review.aggregate([
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

    // 5. Avg Rating of all approved reviews
    const statsAggregation = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = statsAggregation.length > 0 ? Number(statsAggregation[0].avgRating.toFixed(1)) : 0;

    // 6. Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'createdAt_asc') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'rating_desc') {
      sortObj = { rating: -1, createdAt: -1 };
    } else if (sort === 'rating_asc') {
      sortObj = { rating: 1, createdAt: -1 };
    }

    // 7. Execute query
    const reviews = await Review.find(query)
      .populate('product', 'name image')
      .populate('user', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts,
      avgRating
    });
  } catch (error) {
    console.error('Помилка отримання відгуків (адмін):', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання відгуків'
    });
  }
});

router.patch('/:id/status', authenticateToken, moderationAccess, async (req, res) => {
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

// Edit review by author
router.patch('/:id/edit', authenticateToken, async (req, res) => {
  try {
    const { rating, text, pros, cons } = req.body;

    if (!rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Обов\'язкові поля не заповнені'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Відгук не знайдено'
      });
    }

    // Verify review ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'У вас немає прав для редагування цього відгуку'
      });
    }

    review.rating = Number(rating);
    review.text = text;
    review.pros = pros;
    review.cons = cons;
    review.status = 'pending'; // Submit back to moderation

    await review.save();

    res.json({
      success: true,
      review,
      message: 'Відгук оновлено та відправлено на модерацію'
    });
  } catch (error) {
    console.error('Помилка редагування відгуку:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка редагування відгуку'
    });
  }
});

module.exports = router;
