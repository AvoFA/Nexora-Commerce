import { API_BASE_URL } from '../config/api.js';
import { buildQueryString } from '../utils/apiHelpers.js';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error('Сервер клієнтів недоступний. Перевірте, чи запущений backend.');
  }

  return response.json();
};

export const getCustomers = async (token, params = {}) => {
  const queryString = buildQueryString({
    page: params.page,
    limit: params.limit,
    status: params.status,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  });

  const response = await fetch(`${API_BASE_URL}/customers${queryString}`, {
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити список клієнтів');
  }

  return data;
};

export const getCustomerStats = async (token) => {
  const response = await fetch(`${API_BASE_URL}/customers/stats`, {
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити статистику клієнтів');
  }

  return data;
};

export const getCustomerDetails = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити деталі клієнта');
  }

  return data;
};

export const toggleCustomerBlock = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}/toggle-block`, {
    method: 'PATCH',
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося змінити статус блокування клієнта');
  }

  return data;
};
