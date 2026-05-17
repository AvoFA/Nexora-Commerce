const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  await response.text();
  return {
    success: false,
    message: 'Не вдалося отримати списки бажань'
  };
};

const requestWishlist = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}/wishlist${path}`, options);
  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(data.message || 'Не вдалося виконати дію зі списком бажань');
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getWishlist = (token) => (
  requestWishlist('/', {
    headers: getAuthHeaders(token)
  })
);

export const createWishlistList = (name, token) => (
  requestWishlist('/lists', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ name })
  })
);

export const renameWishlistList = (listId, name, token) => (
  requestWishlist(`/lists/${listId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ name })
  })
);

export const deleteWishlistList = (listId, token) => (
  requestWishlist(`/lists/${listId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
);

export const addProductToWishlistList = (listId, productId, token) => (
  requestWishlist(`/lists/${listId}/products/${productId}`, {
    method: 'POST',
    headers: getAuthHeaders(token)
  })
);

export const removeProductFromWishlistList = (listId, productId, token) => (
  requestWishlist(`/lists/${listId}/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
);

export const removeProductFromWishlist = (productId, token) => (
  requestWishlist(`/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
);

export const clearWishlistList = (listId, token) => (
  requestWishlist(`/lists/${listId}/products`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
);
