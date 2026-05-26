const mongoose = require('mongoose');
const path = require('path');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';

const GROUP_MAPPING = {
  "Екран": [
    "Діагональ",
    "Діагональ екрану",
    "Роздільна здатність",
    "Тип матриці",
    "Частота оновлення",
    "Яскравість",
  ],
  "Процесор та Пам'ять": [
    "Процесор",
    "Оперативна пам'ять",
    "Вбудована пам'ять",
    "RAM",
    "SSD",
    "Пам'ять",
    "Тип пам'яті",
    "Відеокарта",
  ],
  "Камера": [
    "Основна камера",
    "Фронтальна камера",
    "Камера",
    "Запис відео",
  ],
  "Зв'язок та ОС": [
    "SIM",
    "Кількість SIM-карт",
    "Операційна система",
    "NFC",
    "Bluetooth",
    "Wi-Fi",
    "Версія ОС",
  ],
  "Корпус": [
    "Колір",
    "Матеріал корпусу",
    "Вага",
    "Габарити",
    "Захист",
    "Комплектація",
  ],
};

function getGroupName(key) {
  if (!key) return "Інші характеристики";

  const trimmedKey = key.trim();
  for (const [groupName, keys] of Object.entries(GROUP_MAPPING)) {
    if (keys.some(k => k.toLowerCase() === trimmedKey.toLowerCase())) {
      return groupName;
    }
  }
  return "Інші характеристики";
}

function groupAttributes(flatAttributes) {
  if (!flatAttributes || !Array.isArray(flatAttributes)) return [];

  const groupsMap = {};

  flatAttributes.forEach(attr => {
    if (attr.groupName && Array.isArray(attr.items)) {
      if (!groupsMap[attr.groupName]) {
        groupsMap[attr.groupName] = [];
      }
      attr.items.forEach(item => {
        if (item.key) {
          groupsMap[attr.groupName].push({
            key: item.key.trim(),
            value: item.value ? String(item.value).trim() : ""
          });
        }
      });
      return;
    }

    if (attr.key) {
      const groupName = getGroupName(attr.key);
      if (!groupsMap[groupName]) {
        groupsMap[groupName] = [];
      }
      groupsMap[groupName].push({
        key: attr.key.trim(),
        value: attr.value ? String(attr.value).trim() : ""
      });
    }
  });

  return Object.entries(groupsMap).map(([groupName, items]) => ({
    groupName,
    items
  }));
}

async function runMigration() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`Starting attributes migration... Mode: ${isDryRun ? 'DRY-RUN (No writes)' : 'LIVE (Will write to DB)'}`);

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully.');

    // Use native collection access so legacy flat attributes can be read before schema validation.
    const db = mongoose.connection.db;

    console.log('\n--- Migrating Categories ---');
    const categoriesCursor = db.collection('categories').find({});
    const categories = await categoriesCursor.toArray();
    console.log(`Found ${categories.length} categories.`);

    for (const cat of categories) {
      const originalAttrs = cat.defaultAttributes || [];
      const isAlreadyGrouped = originalAttrs.length > 0 && originalAttrs[0].groupName !== undefined;

      if (isAlreadyGrouped) {
        console.log(`Category "${cat.name}" is already grouped. Skipping.`);
        continue;
      }

      const groupedAttrs = groupAttributes(originalAttrs);
      console.log(`Category "${cat.name}": converted ${originalAttrs.length} flat attributes to ${groupedAttrs.length} groups.`);

      if (!isDryRun) {
        await db.collection('categories').updateOne(
          { _id: cat._id },
          { $set: { defaultAttributes: groupedAttrs } }
        );
      }
    }

    console.log('\n--- Migrating Products ---');
    const productsCursor = db.collection('products').find({});
    const products = await productsCursor.toArray();
    console.log(`Found ${products.length} products.`);

    let migratedProductsCount = 0;
    for (const prod of products) {
      const originalAttrs = prod.attributes || [];
      const isAlreadyGrouped = originalAttrs.length > 0 && originalAttrs[0].groupName !== undefined;

      if (isAlreadyGrouped) {
        continue;
      }

      const groupedAttrs = groupAttributes(originalAttrs);
      console.log(`Product "${prod.name}": converted ${originalAttrs.length} flat attributes to ${groupedAttrs.length} groups.`);

      migratedProductsCount++;
      if (!isDryRun) {
        await db.collection('products').updateOne(
          { _id: prod._id },
          { $set: { attributes: groupedAttrs } }
        );
      }
    }

    console.log(`\nMigration completed successfully. Total products migrated: ${migratedProductsCount}.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runMigration();
