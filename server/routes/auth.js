const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const adminOnly = requireRole('admin');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-course-work';

const getPublicAuthErrorMessage = (error, fallback) => {
  const message = error?.message || '';

  if (
    error?.code === 11000 ||
    message.includes('E11000') ||
    message.includes('duplicate key') ||
    message.includes('username_1')
  ) {
    return 'Користувач з такими даними вже існує';
  }

  if (message.includes('validation failed') || message.includes('Cast to')) {
    return fallback;
  }

  return message || fallback;
};

router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Ім'я користувача та пароль обов'язкові"
      });
    }

    const user = await UserController.loginUser(username, password);

    if (user) {
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Реєстрація події входу адміністратора
      const reqWithUser = { ...req, user: { id: user.id } };
      await logActivity(reqWithUser, 'auth', 'Успішний вхід в систему');

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        message: 'Успішний вхід адміністратора'
      });
    }
  } catch (error) {
    console.error('Помилка авторизації:', error.message);
  }

  res.status(401).json({
    success: false,
    message: "Невірне ім'я користувача або пароль"
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email та пароль обов'язкові"
      });
    }

    const user = await UserController.loginClientUser(email, password);

    if (user) {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname || '',
          patronymic: user.patronymic || '',
          phone: user.phone || '',
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname || '',
          patronymic: user.patronymic || '',
          phone: user.phone || '',
          role: user.role,
          wishlistProductIds: user.wishlistProductIds || []
        },
        message: 'Успішний вхід'
      });
    }
  } catch (error) {
    console.error('Помилка авторизації клієнта:', error.message);
    return res.status(401).json({
      success: false,
      message: getPublicAuthErrorMessage(error, 'Невірний email або пароль')
    });
  }
});

router.post('/admin/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Ім'я користувача та пароль обов'язкові"
      });
    }

    const newUser = await UserController.createUser(username, password, 'admin');

    res.status(201).json({
      success: true,
      user: newUser,
      message: 'Адміністратора успішно створено'
    });
  } catch (error) {
    console.error('Помилка реєстрації:', error.message);
    res.status(500).json({
      success: false,
      message: getPublicAuthErrorMessage(error, 'Помилка створення адміністратора')
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, ім'я та пароль обов'язкові"
      });
    }

    const newUser = await UserController.createClientUser(email, name, password);

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname || '',
        patronymic: newUser.patronymic || '',
        phone: newUser.phone || '',
        role: newUser.role,
        wishlistProductIds: newUser.wishlistProductIds || []
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname || '',
        patronymic: newUser.patronymic || '',
        phone: newUser.phone || '',
        role: newUser.role,
        wishlistProductIds: newUser.wishlistProductIds || []
      },
      message: 'Користувача успішно зареєстровано'
    });
  } catch (error) {
    console.error('Помилка реєстрації:', error.message);
    res.status(500).json({
      success: false,
      message: getPublicAuthErrorMessage(error, 'Не вдалося створити акаунт')
    });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserController.getUserById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Помилка отримання профілю:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання профілю'
    });
  }
});

router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const updatedUser = await UserController.updateClientProfile(req.user.id, {
      name: req.body.name,
      surname: req.body.surname,
      patronymic: req.body.patronymic,
      phone: req.body.phone
    });

    res.json({
      success: true,
      user: updatedUser,
      message: 'Профіль оновлено'
    });
  } catch (error) {
    console.error('Помилка оновлення профілю:', error.message);
    res.status(400).json({
      success: false,
      message: getPublicAuthErrorMessage(error, 'Не вдалося оновити профіль')
    });
  }
});

router.get('/users', authenticateToken, adminOnly, async (req, res) => {
  try {
    const users = await UserController.getAllUsers();

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Помилка отримання користувачів:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання користувачів'
    });
  }
});

// GET /api/auth/staff - Get all staff members (admin & moderator)
router.get('/staff', authenticateToken, adminOnly, async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'moderator'] } }, { password: 0 }).sort({ createdAt: -1 }).lean();
    
    // Fetch last activity logs for each staff member
    const ActivityLog = require('../models/ActivityLog');
    const staffWithActivity = await Promise.all(
      staff.map(async (member) => {
        const lastLog = await ActivityLog.findOne({ user: member._id })
          .sort({ createdAt: -1 })
          .select('createdAt')
          .lean();
        return {
          ...member,
          lastActivity: lastLog ? lastLog.createdAt : null
        };
      })
    );

    res.json({
      success: true,
      staff: staffWithActivity
    });
  } catch (error) {
    console.error('Помилка отримання списку співробітників:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання списку співробітників'
    });
  }
});

// POST /api/auth/staff - Create a new staff member
router.post('/staff', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Логін, пароль та роль обов'язкові"
      });
    }
    if (!['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Недійсна роль співробітника'
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Співробітник з таким ім'ям вже існує"
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Співробітник з таким email вже існує'
        });
      }
    }

    const hashedPassword = await UserController.hashPassword(password);
    const newUser = new User({
      username,
      email: email ? email.toLowerCase() : undefined,
      password: hashedPassword,
      role,
      status: 'active'
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      message: 'Співробітника успішно додано'
    });
  } catch (error) {
    console.error('Помилка додавання співробітника:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка додавання співробітника'
    });
  }
});

// DELETE /api/auth/staff/:id - Delete a staff member
router.delete('/staff/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Ви не можете видалити самого себе'
      });
    }

    const user = await User.findOne({ _id: id, role: { $in: ['admin', 'moderator'] } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Співробітника не знайдено'
      });
    }

    await User.deleteOne({ _id: id });
    res.json({
      success: true,
      message: 'Співробітника успішно видалено'
    });
  } catch (error) {
    console.error('Помилка видалення співробітника:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення співробітника'
    });
  }
});

// PATCH /api/auth/staff/:id/toggle-block - Toggle block status for a staff member
router.patch('/staff/:id/toggle-block', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Ви не можете заблокувати самого себе'
      });
    }

    const user = await User.findOne({ _id: id, role: { $in: ['admin', 'moderator'] } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Співробітника не знайдено'
      });
    }

    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save();

    res.json({
      success: true,
      status: user.status,
      message: user.status === 'blocked' ? 'Співробітника успішно заблоковано' : 'Співробітника успішно розблоковано'
    });
  } catch (error) {
    console.error('Помилка зміни статусу блокування співробітника:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка зміни статусу блокування співробітника'
    });
  }
});

// PATCH /api/auth/staff/:id/change-password - Change a staff member's password
router.patch('/staff/:id/change-password', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Пароль має бути не менше 6 символів'
      });
    }

    const user = await User.findOne({ _id: id, role: { $in: ['admin', 'moderator'] } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Співробітника не знайдено'
      });
    }

    user.password = await UserController.hashPassword(newPassword);
    await user.save();

    res.json({
      success: true,
      message: 'Пароль співробітника успішно змінено'
    });
  } catch (error) {
    console.error('Помилка зміни паролю співробітника:', error.message);
    res.status(500).json({
      success: false,
      message: 'Помилка зміни паролю співробітника'
    });
  }
});

router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Поточний та новий паролі обов\'язкові'
      });
    }

    const result = await UserController.changeClientPassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Помилка зміни паролю:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, код підтвердження та новий пароль обов\'язкові'
      });
    }

    const result = await UserController.resetClientPassword(email, code, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Помилка скидання паролю:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

