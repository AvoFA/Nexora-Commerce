// server/utils/activityLogger.js
const ActivityLog = require('../models/ActivityLog');

/**
 * Логує адміністративну дію у базі даних.
 * 
 * @param {Object} req - Об'єкт запиту Express
 * @param {string} actionType - Тип дії ('auth', 'orders', 'products', 'moderation')
 * @param {string} description - Зрозумілий опис події українською мовою
 * @param {string|null} targetId - ID об'єкта, над яким виконувалась дія
 * @param {string|null} targetModel - Модель об'єкта для швидких посилань ('Order', 'Product' тощо)
 * @param {Object|null} metadata - Додаткові дані про дію
 */
const logActivity = async (req, actionType, description, targetId = null, targetModel = null, metadata = null) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.warn(`[ActivityLogger] Не вдалося логувати дію: відсутній ID користувача в запиті`);
      return;
    }

    await ActivityLog.create({
      user: userId,
      actionType,
      description,
      targetId,
      targetModel,
      metadata
    });
  } catch (error) {
    console.error('[ActivityLogger] Помилка збереження логу дій:', error.message);
  }
};

module.exports = { logActivity };
