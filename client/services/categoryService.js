// Сервіс для роботи з категоріями
import { API_BASE_URL } from '../config/api.js';
import { getAdminToken } from '../utils/authStorage.js';

const getAdminHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAdminToken()}`
});

const normalizeCategory = (category) => ({
  ...category,
  id: category._id,
  _id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  __v: undefined
});

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Не вдалося завантажити категорії');
    const data = await response.json();
    return data.data.map(normalizeCategory);
  } catch (error) {
    console.error("Помилка при завантаженні категорій:", error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(categoryData)
    });
    if (!response.ok) throw new Error('Не вдалося створити категорію');
    const data = await response.json();
    return normalizeCategory(data.data);
  } catch (error) {
    console.error("Помилка при створенні категорії:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(categoryData)
    });
    if (!response.ok) throw new Error('Не вдалося оновити категорію');
    const data = await response.json();
    return normalizeCategory(data.data);
  } catch (error) {
    console.error("Помилка при оновленні категорії:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (!response.ok) throw new Error('Не вдалося видалити категорію');
    return true;
  } catch (error) {
    console.error("Помилка при видаленні категорії:", error);
    throw error;
  }
};
