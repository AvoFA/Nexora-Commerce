const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserController = require('../controllers/userController');

// Логін для адмінів (username)
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Валідація входу
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Ім\'я користувача та пароль обов\'язкові'
      });
    }

    // Перевірка користувача через контролер
    const user = await UserController.loginUser(username, password);

    // Якщо користувач знайдений та пароль вірний
    if (user) {
      // Створюємо JWT токен
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'super-secret-key-for-course-work',
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

  // Якщо щось пішло не так
  res.status(401).json({
    success: false,
    message: 'Невірне ім\'я користувача або пароль'
  });
});

// Логін для звичайних клієнтів (email)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валідація входу
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email та пароль обов\'язкові'
      });
    }

    // Перевірка клієнта через контролер
    const user = await UserController.loginClientUser(email, password);

    // Якщо користувач знайдений та пароль вірний
    if (user) {
      // Створюємо JWT токен
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        process.env.JWT_SECRET || 'super-secret-key-for-course-work',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          favorites: user.favorites
        },
        message: 'Успішний вхід'
      });
    }

  } catch (error) {
    console.error('Помилка авторизації клієнта:', error.message);
  }

  // Якщо щось пішло не так
  res.status(401).json({
    success: false,
    message: 'Невірний email або пароль'
  });
});

// Роут для реєстрації адміністраторів (username)
router.post('/admin/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Ім\'я користувача та пароль обов\'язкові'
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
      message: error.message || 'Помилка створення адміністратора'
    });
  }
});

// Роут для реєстрації звичайних клієнтів (email + name)
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, ім\'я та пароль обов\'язкові'
      });
    }

    const newUser = await UserController.createClientUser(email, name, password);

    // Створюємо токен одразу після реєстрації
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'super-secret-key-for-course-work',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      message: 'Користувача успішно зареєстровано'
    });

  } catch (error) {
    console.error('Помилка реєстрації:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка створення користувача'
    });
  }
});

// Роут для отримання всіх користувачів (тільки для адмінів)
router.get('/users', async (req, res) => {
  try {
    // Тут можна додати перевірку JWT токена з middleware
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

module.exports = router;
