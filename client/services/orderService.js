import { API_BASE_URL } from '../config/api.js';
import { buildQueryString } from '../utils/apiHelpers.js';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error('Сервер замовлень недоступний. Перевірте, чи запущений backend.');
  }

  return response.json();
};

export const createOrder = async (orderData, token) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(orderData)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося створити замовлення');
  }

  return data;
};

export const getMyOrders = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders/my`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити замовлення');
  }

  return data;
};

export const getAdminOrders = async (token, params = {}) => {
  const queryString = buildQueryString({
    page: params.page,
    limit: params.limit,
    status: params.status,
    cancelledBy: params.cancelledBy,
    search: params.search,
    sort: params.sort,
    customer: params.customer
  });

  const response = await fetch(`${API_BASE_URL}/orders/admin${queryString}`, {
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити замовлення');
  }

  return data;
};

export const updateOrderStatus = async (id, status, token) => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status })
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося оновити статус замовлення');
  }

  return data;
};

export const cancelOrder = async (orderId, payload, token) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося скасувати замовлення');
  }

  return data;
};

export const getAdminDashboardData = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders/admin/dashboard-data`, {
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити дані дашборду');
  }

  return data;
};
