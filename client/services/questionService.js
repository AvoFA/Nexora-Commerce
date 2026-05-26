import { API_BASE_URL } from '../config/api.js';
import { buildQueryString } from '../utils/apiHelpers.js';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error('Сервер запитань недоступний. Перевірте, чи запущений backend.');
  }

  return response.json();
};

export const getProductQuestions = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/questions/product/${productId}`);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити запитання');
  }

  return data;
};

export const createQuestion = async (questionData, token) => {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(questionData)
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося додати запитання');
  }

  return data;
};

export const getUserQuestions = async (token) => {
  const response = await fetch(`${API_BASE_URL}/questions/me`, {
    headers: getAuthHeaders(token)
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити ваші запитання');
  }

  return data.questions;
};

export const getAdminQuestions = async (token, params = {}) => {
  const queryString = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/questions/admin${queryString}`, {
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося завантажити запитання');
  }
  return data;
};

export const updateQuestionStatus = async (id, status, token) => {
  const response = await fetch(`${API_BASE_URL}/questions/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status })
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося оновити статус запитання');
  }
  return data;
};

export const answerQuestion = async (id, answer, token) => {
  const response = await fetch(`${API_BASE_URL}/questions/${id}/answer`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ answer })
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося опублікувати відповідь');
  }
  return data;
};

export const deleteQuestion = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.message || 'Не вдалося видалити запитання');
  }
  return data;
};
