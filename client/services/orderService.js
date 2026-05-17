const API_BASE_URL = 'http://localhost:5000/api';

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

export const getAdminOrders = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders/admin`, {
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
