const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

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

