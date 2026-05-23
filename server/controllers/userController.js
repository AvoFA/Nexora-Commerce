// Контролер для роботи з користувачами
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  validateEmail,
  validateNamePart,
  validatePhone
} = require('../utils/userValidation');

const getWishlistProductIds = (wishlistLists = []) => {
  const ids = new Set();

  wishlistLists.forEach((list) => {
    (list.products || []).forEach((productId) => {
      if (productId) ids.add(productId.toString());
    });
  });

  return Array.from(ids);
};

class UserController {
  // Функція для хешування паролю
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Функція для порівняння паролю з хешем
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Функція для створення нового користувача
  static async createUser(username, password, role = 'admin') {
    try {
      // Перевірка чи користувач вже існує
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error("Користувач з таким ім'ям вже існує");
      }

      // Хешування паролю
      const hashedPassword = await this.hashPassword(password);

      // Створення нового користувача
      const newUser = new User({
        username,
        password: hashedPassword,
        role
      });

      await newUser.save();
      return {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt
      };
    } catch (error) {
      throw new Error(`Помилка створення користувача: ${error.message}`);
    }
  }

  // Функція для авторизації користувача
  static async loginUser(username, password) {
    try {
      // Пошук користувача за ім'ям
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("Невірне ім'я користувача або пароль");
      }

      // Перевірка паролю
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Невірне ім'я користувача або пароль");
      }

      return {
        id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Функція для отримання всіх користувачів (тільки для адмінів)
  static async getAllUsers() {
    try {
      return await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Помилка отримання користувачів: ${error.message}`);
    }
  }

  // Функція для створення користувача-клієнта (email замість username)
  static async createClientUser(email, name, password) {
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const normalizedName = (name || '').trim();
      const emailError = validateEmail(normalizedEmail);
      const nameError = validateNamePart(normalizedName, { label: "Ім'я" });

      if (emailError) throw new Error(emailError);
      if (nameError) throw new Error(nameError);

      // Перевірка чи email вже існує
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new Error('Користувач з таким email вже існує');
      }

      // Хешування паролю
      const hashedPassword = await this.hashPassword(password);

      // Створення нового користувача-клієнта
      const newUser = new User({
        email: normalizedEmail,
        name: normalizedName,
        password: hashedPassword,
        role: 'user',
        wishlistLists: [{ name: 'Обране', products: [] }]
      });

      await newUser.save();
      return {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname || '',
        patronymic: newUser.patronymic || '',
        phone: newUser.phone || '',
        wishlistProductIds: [],
        role: newUser.role,
        createdAt: newUser.createdAt
      };
    } catch (error) {
      throw new Error(`Помилка створення користувача: ${error.message}`);
    }
  }

  // Функція для авторизації клієнта через email
  static async loginClientUser(email, password) {
    try {
      // Пошук користувача за email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Невірний email або пароль');
      }

      // Перевірка чи акаунт заблоковано
      if (user.status === 'blocked') {
        throw new Error('Ваш акаунт заблоковано. Будь ласка, зверніться до підтримки.');
      }

      // Перевірка паролю
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Невірний email або пароль');
      }

      if (!user.email || !user.name) {
        throw new Error('Це не клієнтський акаунт');
      }

      if (!user.wishlistLists || user.wishlistLists.length === 0) {
        user.wishlistLists = [{ name: 'Обране', products: [] }];
        await user.save();
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname || '',
        patronymic: user.patronymic || '',
        phone: user.phone || '',
        wishlistProductIds: getWishlistProductIds(user.wishlistLists),
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Функція для отримання користувача по ID (для профілю)
  static async getUserById(id) {
    try {
      const user = await User.findById(id).populate('wishlistLists.products', 'name price image brand category');
      if (!user) {
        throw new Error('Користувача не знайдено');
      }

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname || '',
        patronymic: user.patronymic || '',
        phone: user.phone || '',
        username: user.username,
        wishlistLists: user.wishlistLists,
        wishlistProductIds: getWishlistProductIds(user.wishlistLists),
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateClientProfile(id, updates = {}) {
    try {
      const name = (updates.name || '').trim();
      const surname = (updates.surname || '').trim();
      const patronymic = (updates.patronymic || '').trim();
      const phone = (updates.phone || '').trim();
      const nameError = validateNamePart(name, { label: "Ім'я" });
      const surnameError = validateNamePart(surname, { required: false, label: 'Прізвище' });
      const patronymicError = validateNamePart(patronymic, { required: false, label: 'По батькові' });
      const phoneError = validatePhone(phone);

      if (nameError) throw new Error(nameError);
      if (surnameError) throw new Error(surnameError);
      if (patronymicError) throw new Error(patronymicError);
      if (phoneError) throw new Error(phoneError);


      const user = await User.findById(id);
      if (!user) {
        throw new Error('Користувача не знайдено');
      }

      user.name = name;
      user.surname = surname;
      user.patronymic = patronymic;
      user.phone = phone;
      await user.save();

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname || '',
        patronymic: user.patronymic || '',
        phone: user.phone || '',
        wishlistProductIds: getWishlistProductIds(user.wishlistLists),
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Функція для зміни паролю
  static async changePassword(username, currentPassword, newPassword) {
    try {
      // Перевірка поточного паролю
      const user = await this.loginUser(username, currentPassword);

      // Хешування нового паролю
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Оновлення паролю
      await User.findByIdAndUpdate(user.id, { password: hashedNewPassword });

      return { success: true, message: 'Пароль успішно змінено' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = UserController;