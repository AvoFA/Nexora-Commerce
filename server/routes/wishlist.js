const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_LIST_NAME = 'Обране';

const ensureDefaultList = async (user) => {
  if (!Array.isArray(user.wishlistLists) || user.wishlistLists.length === 0) {
    user.wishlistLists = [{
      name: DEFAULT_LIST_NAME,
      products: []
    }];
    await user.save();
  }

  return user;
};

const getWishlistProductIds = (wishlistLists = []) => {
  const ids = new Set();

  wishlistLists.forEach((list) => {
    (list.products || []).forEach((product) => {
      const productId = product?._id || product;
      if (productId) ids.add(productId.toString());
    });
  });

  return Array.from(ids);
};

const removeProductFromAllLists = (wishlistLists = [], productId) => {
  wishlistLists.forEach((list) => {
    const initialCount = list.products.length;
    list.products = list.products.filter((id) => id.toString() !== productId);

    if (list.products.length !== initialCount) {
      list.updatedAt = new Date();
    }
  });
};

const getUserWithWishlist = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  await ensureDefaultList(user);

  return User.findById(userId).populate(
    'wishlistLists.products',
    'name price image brand category description _id'
  );
};

const sendWishlist = async (res, userId) => {
  const user = await getUserWithWishlist(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Користувача не знайдено'
    });
  }

  return res.json({
    success: true,
    wishlistLists: user.wishlistLists,
    wishlistProductIds: getWishlistProductIds(user.wishlistLists)
  });
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist load error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка завантаження списків бажань'
    });
  }
});

router.post('/lists', authenticateToken, async (req, res) => {
  try {
    const name = (req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Назва списку обовʼязкова'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    await ensureDefaultList(user);
    user.wishlistLists.push({ name, products: [] });
    await user.save();

    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist list create error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка створення списку'
    });
  }
});

router.patch('/lists/:listId', authenticateToken, async (req, res) => {
  try {
    const name = (req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Назва списку обовʼязкова'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    await ensureDefaultList(user);
    const list = user.wishlistLists.id(req.params.listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Список не знайдено'
      });
    }

    list.name = name;
    list.updatedAt = new Date();
    await user.save();

    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist list rename error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка перейменування списку'
    });
  }
});

router.delete('/lists/:listId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    await ensureDefaultList(user);

    if (user.wishlistLists.length <= 1) {
      user.wishlistLists[0].name = DEFAULT_LIST_NAME;
      user.wishlistLists[0].products = [];
      user.wishlistLists[0].updatedAt = new Date();
    } else {
      user.wishlistLists.pull(req.params.listId);
    }

    await user.save();
    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist list delete error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка видалення списку'
    });
  }
});

router.post('/lists/:listId/products/:productId', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не знайдено'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    await ensureDefaultList(user);
    const list = user.wishlistLists.id(req.params.listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Список не знайдено'
      });
    }

    removeProductFromAllLists(user.wishlistLists, req.params.productId);
    list.products.push(req.params.productId);
    list.updatedAt = new Date();
    await user.save();

    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist product add error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка додавання товару до списку'
    });
  }
});

router.delete('/products/:productId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    await ensureDefaultList(user);
    removeProductFromAllLists(user.wishlistLists, req.params.productId);
    await user.save();

    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist product remove all error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка видалення товару зі списків'
    });
  }
});

router.delete('/lists/:listId/products', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    await ensureDefaultList(user);
    const list = user.wishlistLists.id(req.params.listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Список не знайдено'
      });
    }

    list.products = [];
    list.updatedAt = new Date();
    await user.save();

    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist list clear error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка очищення списку'
    });
  }
});

router.delete('/lists/:listId/products/:productId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    await ensureDefaultList(user);
    const list = user.wishlistLists.id(req.params.listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Список не знайдено'
      });
    }

    list.products = list.products.filter((id) => id.toString() !== req.params.productId);
    list.updatedAt = new Date();
    await user.save();

    return sendWishlist(res, req.user.id);
  } catch (error) {
    console.error('Wishlist product remove error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Помилка видалення товару зі списку'
    });
  }
});

module.exports = router;
