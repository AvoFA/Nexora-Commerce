const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';

async function seedReviews() {
  try {
    console.log('🔄 Підключення до MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Підключено до MongoDB успішно');

    // Знайти тестового користувача або створити його
    let testUser = await User.findOne({ username: 'testuser' });
    if (!testUser) {
      console.log('👤 Створення тестового користувача...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('testuser123', 10);
      testUser = new User({
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
        name: 'Тест Користувач',
        email: 'test@example.com'
      });
      await testUser.save();
      console.log('✅ Тестового користувача створено');
    }

    // Отримати кілька товарів
    const products = await Product.find().limit(3);
    
    if (products.length < 3) {
      console.log('⚠️ Потрібно щонайменше 3 товари в базі для створення повноцінних тестових даних відгуків. Спробуйте запустити seed-скрипт товарів.');
      process.exit(1);
    }

    console.log(`📦 Знайдено ${products.length} товарів для відгуків`);

    // Видалити старі відгуки тестового користувача
    await Review.deleteMany({ user: testUser._id });
    console.log('🗑️ Старі відгуки тестового користувача видалено');

    // Створити 3 відгуки з різними статусами
    const reviews = [
      {
        user: testUser._id,
        product: products[0]._id,
        name: testUser.name,
        rating: 5,
        text: 'Чудовий товар! Дуже задоволений покупкою. Рекомендую всім.',
        pros: 'Якість, ціна, дизайн',
        cons: 'Не знайшов',
        status: 'approved'
      },
      {
        user: testUser._id,
        product: products[1]._id,
        name: testUser.name,
        rating: 4,
        text: 'В цілому непогано, але є нюанси з налаштуванням. Доставили швидко.',
        pros: 'Швидка доставка, гарний вигляд',
        cons: 'Складна інструкція',
        status: 'pending'
      },
      {
        user: testUser._id,
        product: products[2]._id,
        name: testUser.name,
        rating: 2,
        text: 'Товар не відповідає опису на сайті. Колір зовсім інший і якість пластику сумнівна.',
        pros: '',
        cons: 'Погана якість, невідповідність опису',
        status: 'rejected'
      }
    ];

    for (const reviewData of reviews) {
      const review = new Review(reviewData);
      await review.save();
      console.log(`📝 Створено відгук для товару ${reviewData.product} зі статусом ${reviewData.status}`);
    }

    console.log('🎉 Сідінг відгуків успішно завершено!');
    console.log('🔑 Тепер можна увійти з наступними даними для перевірки відгуків (на клієнті):');
    console.log("  Ім'я: testuser");
    console.log('  Пароль: testuser123');

  } catch (error) {
    console.error('❌ Помилка створення відгуків:', error);
  } finally {
    console.log('🔌 Відключення від MongoDB...');
    await mongoose.disconnect();
  }
}

// Запуск скрипта
if (require.main === module) {
  console.log('🚀 Запуск seedReviews скрипта...');
  seedReviews()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Помилка виконання скрипта:', error);
      process.exit(1);
    });
}

module.exports = seedReviews;
