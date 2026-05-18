const API_BASE_URL = 'http://localhost:5000/api';

const parseDeliveryResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error('Сервіс доставки недоступний. Перевірте, чи запущений backend.');
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || 'Не вдалося завантажити дані доставки');
  }

  return Array.isArray(data.data) ? data.data : [];
};

export const searchDeliveryCities = async (search, options = {}) => {
  const query = new URLSearchParams({ search: search || '' });
  const response = await fetch(`${API_BASE_URL}/delivery/cities?${query}`, {
    signal: options.signal,
  });

  return parseDeliveryResponse(response);
};

export const getDeliveryWarehouses = async (cityRef, options = {}) => {
  const query = new URLSearchParams({ cityRef });
  const response = await fetch(`${API_BASE_URL}/delivery/warehouses?${query}`, {
    signal: options.signal,
  });

  return parseDeliveryResponse(response);
};
