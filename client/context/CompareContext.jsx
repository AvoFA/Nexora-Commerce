import { createContext, useEffect, useReducer, useRef } from 'react';
import { showCompareAddedToast, showCompareExistsToast } from '../utils/notifications.js';

export const CompareContext = createContext();

const STORAGE_KEY = 'compare_items';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { items: parsed };
    }
  } catch {
    // Ignore broken localStorage data and start with an empty list.
  }

  return { items: [] };
};

const getProductId = (product) => product?._id || product?.id;

const compareReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const itemToAdd = action.payload;
      const itemId = getProductId(itemToAdd);

      const alreadyExists = state.items.some((item) => getProductId(item) === itemId);

      if (alreadyExists) {
        showCompareExistsToast(action.anchor);
        return state;
      }

      showCompareAddedToast(action.anchor);
      return { ...state, items: [...state.items, itemToAdd] };
    }

    case 'REMOVE_ITEM': {
      const idToRemove = action.payload;
      return {
        ...state,
        items: state.items.filter((item) => getProductId(item) !== idToRemove)
      };
    }

    case 'CLEAR_COMPARE':
      return { ...state, items: [] };

    default:
      return state;
  }
};

export const CompareProvider = ({ children }) => {
  const [state, dispatch] = useReducer(compareReducer, undefined, loadFromStorage);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Не вдалося зберегти порівняння:', error);
    }
  }, [state.items]);

  return (
    <CompareContext.Provider value={{ state, dispatch }}>
      {children}
    </CompareContext.Provider>
  );
};
