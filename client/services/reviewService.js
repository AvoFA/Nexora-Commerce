const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error('Сервер відгуків недоступний. Перевірте, чи запущений backend.');
  }

  return response.json();
};

export const getProductReviews = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити відгуки');
  }

  return data;
};

export const createReview = async (reviewData, token) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(reviewData)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося додати відгук');
  }

  return data;
};

export const getUserProductReview = async (productId, token) => {
  const response = await fetch(`${API_BASE_URL}/reviews/me/product/${productId}`, {
    headers: getAuthHeaders(token)
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити ваш відгук');
  }

  return data.review;
};

export const updateUserReview = async (id, reviewData, token) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${id}/edit`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(reviewData)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося оновити відгук');
  }

  return data;
};

export const getAdminReviews = async (token) => {
  const response = await fetch(`${API_BASE_URL}/reviews/admin`, {
    headers: getAuthHeaders(token)
  });
  
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити відгуки');
  }
  return data;
};

export const updateReviewStatus = async (id, status, token) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status })
  });
  
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося оновити статус відгуку');
  }
  return data;
};
