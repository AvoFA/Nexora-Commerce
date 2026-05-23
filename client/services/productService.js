const API_BASE_URL = 'http://localhost:5000/api';

const getAdminHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken') || ''}`
});

// Підставляємо замість _id звичайний id
const normalizeProduct = (product) => {
  return {
    ...product,
    id: product._id,
    _id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    __v: undefined
  };
};

// Отримуємо всі товари для головної сторінки
export const getProducts = async () => {
  try {
    console.log("Завантажую товари із сервера...");
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Отримав ${data.data.length} товарів`);

    return data.data.map(normalizeProduct);

  } catch (error) {
    console.warn("Не вдалося завантажити товари:", error.message);
    return [];
  }
};

// Знаходимо товар за його ID
export const getProductById = async (id) => {
  try {
    console.log("Шукаю товар з ID:", id);
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Знайшов товар: ${data.data.name}`);
    return normalizeProduct(data.data);

  } catch (error) {
    console.warn("Не вдалося знайти товар:", error.message);
    throw new Error('Товар не знайдено - проблема з сервером');
  }
};

// Шукаємо схожі товари для рекомендацій на сторінці товару
export const getSimilarProducts = async (currentProductId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${currentProductId}/similar`);

    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    const { data } = await response.json();
    return data.map(normalizeProduct);
  } catch (error) {
    console.warn("Не вдалося завантажити схожі товари:", error.message);
    return [];
  }
};

// Створюємо новий товар (використовується в адмінці)
export const createProduct = async (productData) => {
  try {
    // готуємо дані під поля сервера
    const payload = {
      ...productData,
      image: productData.imageUrl || productData.image
    };

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Не вдалося створити товар');
    const data = await response.json();
    return normalizeProduct(data.data);
  } catch (error) {
    console.error("Не вдалося створити товар:", error);
    throw error;
  }
};

// Оновлюємо існуючий товар
export const updateProduct = async (id, productData) => {
  try {
    // готуємо дані для сервера
    const payload = {
      ...productData,
      image: productData.imageUrl || productData.image
    };

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Не вдалося оновити товар');
    const data = await response.json();
    return normalizeProduct(data.data);
  } catch (error) {
    console.error("Не вдалося оновити товар:", error);
    throw error;
  }
};

// Видаляємо товар за ID
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (!response.ok) throw new Error('Не вдалося видалити товар');
    return true;
  } catch (error) {
    console.error("Не вдалося видалити товар:", error);
    throw error;
  }
};
