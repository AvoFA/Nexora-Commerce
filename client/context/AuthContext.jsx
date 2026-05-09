import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { addToFavorites as addToFavoritesAPI, removeFromFavorites as removeFromFavoritesAPI } from '../services/favoritesService.js';

// AuthContext для управління авторизацією клієнтів та wishlist

// Стан за замовчуванням
const initialState = {
  user: null, // Об'єкт користувача
  isAuthenticated: false, // Чи авторизований
  favorites: [], // Список улюблених товарів
  loading: false, // Стан завантаження
  error: null // Помилки
};

// Типи дій
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_FAVORITES: 'UPDATE_FAVORITES',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE'
};

// Reducer для керування станом
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case AuthActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        favorites: action.payload.favorites || [],
        loading: false,
        error: null
      };
    case AuthActionTypes.LOGOUT:
      return { ...initialState };
    case AuthActionTypes.UPDATE_FAVORITES:
      return { ...state, favorites: action.payload };
    case AuthActionTypes.ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };
    case AuthActionTypes.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload)
      };
    default:
      return state;
  }
};

// Створення контексу
const AuthContext = createContext();

// Провайдер контексу: обгортає додаток і надає доступ до авторизації
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Відновлюємо сесію користувача при завантаженні сторінки
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const favorites = localStorage.getItem('favorites');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        const parsedFavorites = favorites ? JSON.parse(favorites) : [];

        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: parsedUser,
            favorites: parsedFavorites
          }
        });
      } catch (error) {
        // Якщо дані пошкоджені — очищаємо все
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('favorites');
      }
    }
  }, []);

  // Допоміжна функція: зберігаємо сесію в браузері
  const saveToLocalStorage = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('favorites', JSON.stringify(user.favorites || []));
  };

  // Авторизація (Вхід)
  const login = async (email, password) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.SET_ERROR, payload: null });

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          favorites: data.user.favorites || []
        };

        // Успішний вхід: зберігаємо токен і оновлюємо стан
        saveToLocalStorage(userData, data.token);
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: userData,
            favorites: userData.favorites
          }
        });

        return { success: true };
      } else {
        dispatch({ type: AuthActionTypes.SET_ERROR, payload: data.message });
        return { success: false, message: data.message };
      }
    } catch (error) {
      const message = 'Помилка з\'єднання. Спробуйте пізніше.';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      return { success: false, message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  // Реєстрація нового користувача
  const register = async (email, name, password) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.SET_ERROR, payload: null });

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          favorites: []
        };

        // Одразу входимо після реєстрації
        saveToLocalStorage(userData, data.token);
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: userData,
            favorites: []
          }
        });

        return { success: true };
      } else {
        dispatch({ type: AuthActionTypes.SET_ERROR, payload: data.message });
        return { success: false, message: data.message };
      }
    } catch (error) {
      const message = 'Помилка реєстрації. Спробуйте пізніше.';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      return { success: false, message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  // Вихід із системи
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    dispatch({ type: AuthActionTypes.LOGOUT });
  };

  // Додавання товару в обране
  const addToFavorites = async (productId) => {
    if (!state.isAuthenticated) return { success: false, message: 'Увійдіть для додавання до улюблених' };

    const token = localStorage.getItem('token');
    try {
      const data = await addToFavoritesAPI(productId, token);

      if (data.success) {
        dispatch({ type: AuthActionTypes.ADD_FAVORITE, payload: productId });

        // Оновлюємо кеш в localStorage
        const updatedFavorites = [...state.favorites, productId];
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Помилка з\'єднання' };
    }
  };

  // Видалення товару з обраного
  const removeFromFavorites = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const data = await removeFromFavoritesAPI(productId, token);

      if (data.success) {
        dispatch({ type: AuthActionTypes.REMOVE_FAVORITE, payload: productId });

        // Оновлюємо кеш в localStorage
        const updatedFavorites = state.favorites.filter(id => id !== productId);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Помилка з\'єднання' };
    }
  };

  // Перевіряємо, чи є товар в улюблених (true/false)
  const isFavorite = (productId) => {
    return state.favorites.includes(productId);
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    favorites: state.favorites,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для використання контексу
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
