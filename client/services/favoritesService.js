const API_BASE_URL = 'http://localhost:5000/api';

// Отримати список улюблених товарів
export const getFavorites = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Не вдалося завантажити улюблені товари');
    }

    return data;
  } catch (error) {
    console.error("Помилка при отриманні улюблених товарів:", error);
    throw error;
  }
};

// Додати товар до улюблених
export const addToFavorites = async (productId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/add/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Не вдалося додати до улюблених');
    }

    return data;
  } catch (error) {
    console.error("Помилка при додаванні до улюблених:", error);
    throw error;
  }
};

// Видалити товар з улюблених
export const removeFromFavorites = async (productId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/remove/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Не вдалося видалити з улюблених');
    }

    return data;
  } catch (error) {
    console.error("Помилка при видаленні з улюблених:", error);
    throw error;
  }
};

// Очистити всі улюблені
export const clearAllFavorites = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Не вдалося очистити улюблені');
    }

    return data;
  } catch (error) {
    console.error("Помилка при очищенні улюблених:", error);
    throw error;
  }
};

