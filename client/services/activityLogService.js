import { API_BASE_URL } from '../config/api.js';
import { getAdminToken } from '../utils/authStorage.js';

const getAdminHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAdminToken()}`
});

/**
 * Отримує список логів дій адміністратора з фільтрацією та пагінацією.
 * 
 * @param {Object} filters - Фільтри запиту
 * @param {string} filters.actionType - Тип дії ('all', 'auth', 'orders', 'products', 'moderation')
 * @param {number} filters.page - Номер сторінки
 * @param {number} filters.limit - Кількість записів на сторінку
 * @returns {Promise<Object>} Обіцянка з об'єктом логів, загальною кількістю тощо.
 */
export const getActivityLogs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.actionType && filters.actionType !== 'all') {
      params.append('actionType', filters.actionType);
    }
    if (filters.targetModel && filters.targetModel !== 'all') {
      params.append('targetModel', filters.targetModel);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const response = await fetch(`${API_BASE_URL}/activity-logs?${params.toString()}`, {
      headers: getAdminHeaders()
    });

    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[ActivityLogService] Не вдалося завантажити журнал дій:", error.message);
    return { success: false, logs: [], total: 0, page: 1, totalPages: 1 };
  }
};
