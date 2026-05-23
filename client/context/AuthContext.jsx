import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { getWishlist } from '../services/wishlistService.js';

const initialState = {
  user: null,
  isAuthenticated: false,
  wishlistProductIds: [],
  loading: false,
  error: null
};

const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_WISHLIST_PRODUCT_IDS: 'UPDATE_WISHLIST_PRODUCT_IDS'
};

const normalizeIds = (ids = []) => Array.from(new Set(ids.map((id) => String(id))));

const getPublicAuthMessage = (message, fallback) => {
  if (!message || typeof message !== 'string') return fallback;

  const technicalPatterns = [
    'E11000',
    'duplicate key',
    'username_1',
    'Cast to',
    'ValidationError',
    'validation failed',
    'MongoServerError'
  ];

  if (technicalPatterns.some((pattern) => message.includes(pattern))) {
    return fallback;
  }

  return message;
};

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
        wishlistProductIds: normalizeIds(action.payload.wishlistProductIds),
        loading: false,
        error: null
      };
    case AuthActionTypes.LOGOUT:
      return { ...initialState };
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    case AuthActionTypes.UPDATE_WISHLIST_PRODUCT_IDS:
      return {
        ...state,
        wishlistProductIds: normalizeIds(action.payload)
      };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const wishlistProductIds = localStorage.getItem('wishlistProductIds');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        const parsedWishlistProductIds = wishlistProductIds ? JSON.parse(wishlistProductIds) : [];

        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: parsedUser,
            wishlistProductIds: parsedWishlistProductIds
          }
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('wishlistProductIds');
      }
    }
  }, []);

  const saveToLocalStorage = (user, token, wishlistProductIds = []) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('wishlistProductIds', JSON.stringify(normalizeIds(wishlistProductIds)));
  };

  const updateWishlistProductIds = (ids = []) => {
    const normalizedIds = normalizeIds(ids);
    localStorage.setItem('wishlistProductIds', JSON.stringify(normalizedIds));
    dispatch({
      type: AuthActionTypes.UPDATE_WISHLIST_PRODUCT_IDS,
      payload: normalizedIds
    });
  };

  const refreshWishlistProductIds = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const data = await getWishlist(token);
    updateWishlistProductIds(data.wishlistProductIds || []);
    return data.wishlistProductIds || [];
  };

  const updateUserData = (updates = {}) => {
    const updatedUser = {
      ...state.user,
      ...updates
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: AuthActionTypes.UPDATE_USER,
      payload: updates
    });
  };

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
          surname: data.user.surname || '',
          patronymic: data.user.patronymic || '',
          phone: data.user.phone || '',
          role: data.user.role,
          wishlistProductIds: data.user.wishlistProductIds || []
        };

        saveToLocalStorage(userData, data.token, userData.wishlistProductIds);
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: userData,
            wishlistProductIds: userData.wishlistProductIds
          }
        });

        return { success: true };
      }

      const message = getPublicAuthMessage(data.message, 'Невірний email або пароль.');
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      return { success: false, message };
    } catch (error) {
      const message = 'Помилка зʼєднання. Спробуйте пізніше.';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      return { success: false, message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  const register = async (email, name, password) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    dispatch({ type: AuthActionTypes.SET_ERROR, payload: null });

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          surname: data.user.surname || '',
          patronymic: data.user.patronymic || '',
          phone: data.user.phone || '',
          role: data.user.role,
          wishlistProductIds: data.user.wishlistProductIds || []
        };

        saveToLocalStorage(userData, data.token, userData.wishlistProductIds);
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: {
            user: userData,
            wishlistProductIds: userData.wishlistProductIds
          }
        });

        return { success: true };
      }

      const message = getPublicAuthMessage(data.message, 'Не вдалося створити акаунт.');
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      return { success: false, message };
    } catch (error) {
      const message = 'Помилка реєстрації. Спробуйте пізніше.';
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: message });
      return { success: false, message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('wishlistProductIds');
    dispatch({ type: AuthActionTypes.LOGOUT });
  };

  const clearError = useCallback(() => {
    dispatch({ type: AuthActionTypes.SET_ERROR, payload: null });
  }, []);

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return state.wishlistProductIds.includes(String(productId));
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    wishlistProductIds: state.wishlistProductIds,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
    isWishlisted,
    refreshWishlistProductIds,
    updateUserData,
    updateWishlistProductIds
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
