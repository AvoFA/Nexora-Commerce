// Скрипт для створення початкових користувачів в базі даних
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Налаштування підключення до бази даних
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';

// Початкові дані для створення користувачів
const initialUsers = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'moderator@nexora.test',
    password: 'Moderator123!',
    role: 'moderator'
  }
];

async function seedUsers() {
  try {
    console.log('🔄 Підключення до MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Підключено до MongoDB успішно');

    for (const u of initialUsers) {
      console.log(`🔍 Перевірка наявності користувача ${u.username}...`);
      const existingUser = await User.findOne({ username: u.username });

      if (existingUser) {
        console.log(`⚠️ Користувач ${u.username} вже існує в базі даних (роль: ${existingUser.role})`);
        continue;
      }

      console.log(`🔐 Хешування паролю для ${u.username}...`);
      const hashedPassword = await bcrypt.hash(u.password, 10);

      console.log(`👤 Створення користувача ${u.username}...`);
      const newUser = new User({
        username: u.username,
        password: hashedPassword,
        role: u.role
      });

      await newUser.save();
      console.log(`🎉 Користувача ${u.username} успішно створено!`);
    }

  } catch (error) {
    console.error('❌ Помилка створення користувачів:', error.message);
    process.exit(1);
  } finally {
    // Закрити з'єднання з базою даних
    console.log('🔌 Відключення від MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Відключено від MongoDB');
  }
}

// Обробка невловних помилок
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Невловна помилка:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Невловна помилка:', error);
  process.exit(1);
});

// Запуск скрипта
if (require.main === module) {
  console.log('🚀 Запуск seedUsers скрипта...');
  seedUsers()
    .then(() => {
      console.log('✅ Скрипт виконано успішно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Помилка виконання скрипта:', error);
      process.exit(1);
    });
}

module.exports = seedUsers;
