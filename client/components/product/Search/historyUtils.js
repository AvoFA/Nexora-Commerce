/**
 * Utility functions for search history management in localStorage.
 */

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('search_history')) || [];
  } catch {
    return [];
  }
};

export const addToHistory = (query) => {
  const trimmed = query?.trim();
  if (!trimmed) return getHistory();

  const current = getHistory();
  const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 5);
  localStorage.setItem('search_history', JSON.stringify(next));
  return next;
};

export const removeFromHistory = (query) => {
  const current = getHistory();
  const next = current.filter((item) => item !== query);
  localStorage.setItem('search_history', JSON.stringify(next));
  return next;
};

export const clearSearchHistory = () => {
  localStorage.removeItem('search_history');
  return [];
};
