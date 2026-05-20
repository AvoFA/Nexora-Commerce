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
    console.log("Шукаю схожі товари для товару:", currentProductId);

    // спочатку отримуємо сам товар
    const currentProduct = await getProductById(currentProductId);

    // отримуємо всі товари
    const allProducts = await getProducts();

    // вилучаємо сам товар, щоб не рекомендувати його
    const otherProducts = allProducts.filter(p => p.id !== currentProductId);

    // алгоритм пошуку схожих товарів
    let candidates = [];

    // 1. з тим самим брендом та категорією
    const sameBrandAndCategory = otherProducts.filter(p =>
      p.brand === currentProduct.brand && p.category === currentProduct.category
    );
    candidates.push(...sameBrandAndCategory);

    // 2. тієї ж категорії але інший бренд
    if (candidates.length < 3) {
      const sameCategory = otherProducts.filter(p =>
        p.category === currentProduct.category &&
        p.brand !== currentProduct.brand &&
        !candidates.some(c => c.id === p.id)
      );
      candidates.push(...sameCategory);
    }

    // 3. того ж бренду але інша категорія
    if (candidates.length < 3) {
      const sameBrand = otherProducts.filter(p =>
        p.brand === currentProduct.brand &&
        p.category !== currentProduct.category &&
        !candidates.some(c => c.id === p.id)
      );
      candidates.push(...sameBrand);
    }

    // 4. якщо мало товарів - додаємо за ціною
    if (candidates.length < 3) {
      const priceRange = currentProduct.price * 0.2; // ±20% від ціни
      const similarPrice = otherProducts.filter(p =>
        Math.abs(p.price - currentProduct.price) <= priceRange &&
        !candidates.some(c => c.id === p.id)
      );
      candidates.push(...similarPrice);
    }

    // сортуємо за близькістю ціни
    candidates.sort((a, b) => {
      const diffA = Math.abs(a.price - currentProduct.price);
      const diffB = Math.abs(b.price - currentProduct.price);
      return diffA - diffB;
    });

    console.log(`Знайшов ${candidates.slice(0, 3).length} схожих товарів`);
    return candidates.slice(0, 3);

  } catch (error) {
    console.warn("Не вдалося знайти схожі товари:", error.message);
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
