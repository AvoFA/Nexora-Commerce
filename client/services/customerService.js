const API_BASE_URL = 'http://localhost:5000/api';

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
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const queryString = query.toString() ? `?${query.toString()}` : '';

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
