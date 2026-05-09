// Скрипт для створиення початкових користувачів в базі даних
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Налаштування підключення до бази даних
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';

// Початкові дані для створення адміністратора
const initialAdmin = {
  username: 'admin',
  password: 'admin123',
  role: 'admin'
};

async function seedUsers() {
  try {
    console.log('🔄 Підключення до MongoDB...');

    // Підключення до бази даних
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Підключено до MongoDB успішно');

    // Перевірка чи адміністратор вже існує
    console.log('🔍 Перевірка наявності адміністратора...');
    const existingAdmin = await User.findOne({ username: initialAdmin.username });

    if (existingAdmin) {
      console.log('⚠️ Адміністратор вже існує в базі даних:');
      console.log('  - Ім\'я:', existingAdmin.username);
      console.log('  - Роль:', existingAdmin.role);
      console.log('  - Створено:', existingAdmin.createdAt);
      return;
    }

    // Створення хешу паролю
    console.log('🔐 Хешування паролю...');
    const hashedPassword = await bcrypt.hash(initialAdmin.password, 10);

    // Створення адміністратора
    console.log('👤 Створення адміністратора...');
    const adminUser = new User({
      username: initialAdmin.username,
      password: hashedPassword,
      role: initialAdmin.role
    });

    await adminUser.save();

    console.log('🎉 Адміністратора успішно створено!');
    console.log('📋 Дані адміністратора:');
    console.log('  - Ім\'я:', adminUser.username);
    console.log('  - Роль:', adminUser.role);
    console.log('  - ID:', adminUser._id);
    console.log('  - Створено:', adminUser.createdAt);
    console.log('');
    console.log('🔑 Тепер можна увійти з наступними даними:');
    console.log('  Ім\'я:', initialAdmin.username);
    console.log('  Пароль:', initialAdmin.password);

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
