// Brand management API client service
import { API_BASE_URL } from '../config/api.js';
import { getAdminToken } from '../utils/authStorage.js';

const getAdminHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAdminToken()}`
});

const normalizeBrand = (brand) => ({
  ...brand,
  id: brand._id,
  _id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  __v: undefined
});

export const getBrands = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    if (!response.ok) throw new Error('Не вдалося завантажити бренди');
    const data = await response.json();
    return data.data.map(normalizeBrand);
  } catch (error) {
    console.error("Помилка при завантаженні брендів:", error);
    return [];
  }
};

export const createBrand = async (brandData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(brandData)
    });
    if (!response.ok) throw new Error('Не вдалося створити бренд');
    const data = await response.json();
    return normalizeBrand(data.data);
  } catch (error) {
    console.error("Помилка при створенні бренду:", error);
    throw error;
  }
};

export const updateBrand = async (id, brandData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(brandData)
    });
    if (!response.ok) throw new Error('Не вдалося оновити бренд');
    const data = await response.json();
    return normalizeBrand(data.data);
  } catch (error) {
    console.error("Помилка при оновленні бренду:", error);
    throw error;
  }
};

export const deleteBrand = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (!response.ok) throw new Error('Не вдалося видалити бренд');
    return true;
  } catch (error) {
    console.error("Помилка при видаленні бренду:", error);
    throw error;
  }
};
