import { API_BASE_URL } from '../config/api.js';
import { getAdminToken } from '../utils/authStorage.js';

const getAdminHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAdminToken()}`
});

// Normalize _id to standard id
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

// Get all products
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map(normalizeProduct);

  } catch (error) {
    console.warn("[ProductService] Не вдалося завантажити товари:", error.message);
    return [];
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    const data = await response.json();
    return normalizeProduct(data.data);

  } catch (error) {
    console.warn("[ProductService] Не вдалося знайти товар:", error.message);
    throw new Error('Товар не знайдено - проблема з сервером');
  }
};

// Get similar products for recommendation
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

// Create a new product (admin only)
export const createProduct = async (productData) => {
  try {
    // Map fields to match server payload
    const payload = {
      ...productData,
      compareAtPrice: productData.compareAtPrice === '' ? null : productData.compareAtPrice,
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

// Update existing product
export const updateProduct = async (id, productData) => {
  try {
    // Map fields to match server payload
    const payload = {
      ...productData,
      compareAtPrice: productData.compareAtPrice === '' ? null : productData.compareAtPrice,
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

// Delete product by ID
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

// Search products by query
export const searchProducts = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map(normalizeProduct);
  } catch (error) {
    console.warn("[ProductService] Помилка при пошуку товарів:", error.message);
    return [];
  }
};

export const importProducts = async (products) => {
  const response = await fetch(`${API_BASE_URL}/products/import`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(products)
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data.message || 'Помилка імпорту товарів';
    throw new Error(msg);
  }

  return data;
};
