require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Question = require('./models/Question');

async function seedQuestions() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Fetch users and products
    const users = await User.find({});
    const products = await Product.find({});

    if (users.length === 0) {
      console.error('❌ Error: No users found in database. Run seed script for users or create users first.');
      process.exit(1);
    }
    if (products.length === 0) {
      console.error('❌ Error: No products found in database. Run seed script for products or create products first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and ${products.length} products.`);

    // Clear existing questions
    await Question.deleteMany({});
    console.log('🧹 Cleared existing questions.');

    // Helper to get random item
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const mockQuestions = [
      {
        text: 'Чи підійде цей товар для щоденного використання та наскільки він зносостійкий?',
        answer: 'Так, звичайно! Матеріал дуже міцний і розрахований на тривалу активну експлуатацію. Гарантія 12 місяців.',
        status: 'approved'
      },
      {
        text: 'Яка країна-виробник цього товару? Чи є офіційні сертифікати якості?',
        answer: 'Виробник — Польща. Товар повністю сертифікований в Україні, всі документи надаємо за запитом.',
        status: 'approved'
      },
      {
        text: 'Чи є в комплекті додаткові аксесуари чи кабелі живлення?',
        status: 'pending'
      },
      {
        text: 'Чи планується найближчим часом поставка цієї моделі в білому або сріблястому кольорі?',
        status: 'approved'
      },
      {
        text: 'Вітаю! Підкажіть, будь ласка, точні габарити упаковки для прорахунку вартості доставки Новою Поштою.',
        status: 'pending'
      },
      {
        text: 'Яка довжина мережевого шнура? Чи можна використовувати подовжувач?',
        answer: 'Довжина мережевого шнура становить 1.8 метри. Використовувати якісний подовжувач дозволяється.',
        status: 'approved'
      },
      {
        text: 'Віддайте безкоштовно, або за півціни, у мене немає грошей!',
        status: 'rejected'
      },
      {
        text: 'Чи сумісний цей пристрій з операційною системою iOS 15 та новішими версіями?',
        status: 'pending'
      },
      {
        text: 'Який термін гарантійного обслуговування? Куди звертатися у разі виникнення несправностей?',
        answer: 'Гарантія 12 місяців від нашого магазину. Сервісний центр знаходиться у м. Київ, контакти є в гарантійному талоні.',
        status: 'approved'
      },
      {
        text: 'Чи можна оформити покупку в розстрочку через ПриватБанк або Монобанк?',
        status: 'approved'
      }
    ];

    const questionsToInsert = mockQuestions.map((q, idx) => {
      // Pick random user and product
      const user = getRandom(users);
      const product = getRandom(products);

      return {
        user: user._id,
        product: product._id,
        name: user.name || user.username || 'Користувач',
        text: q.text,
        answer: q.answer || '',
        status: q.status,
        createdAt: new Date(Date.now() - idx * 3600000 * 4) // spaced out in time
      };
    });

    const result = await Question.insertMany(questionsToInsert);
    console.log(`✅ Successfully seeded ${result.length} questions.`);

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
}

seedQuestions();
