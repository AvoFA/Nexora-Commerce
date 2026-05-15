// Контекст для порівняння товарів

import { createContext, useReducer, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Створюємо контекст порівняння
export const CompareContext = createContext();

const STORAGE_KEY = 'compare_items';

// Завантажуємо початковий стан з localStorage один раз
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { items: parsed };
    }
  } catch {
    // ігноруємо помилки
  }
  return { items: [] };
};

// Reducer для керування станом порівняння
const compareReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const itemToAdd = action.payload;
      const itemId = itemToAdd._id || itemToAdd.id;

      // Перевіряємо чи товар вже в списку
      const alreadyExists = state.items.some(item => {
        const id = item._id || item.id;
        return id === itemId;
      });

      if (alreadyExists) {
        toast.info('Цей товар вже додано до порівняння');
        return state;
      }

      toast.success('Товар додано до порівняння');
      return { ...state, items: [...state.items, itemToAdd] };
    }

    case 'REMOVE_ITEM': {
      const idToRemove = action.payload;
      const newItems = state.items.filter(item => {
        const id = item._id || item.id;
        return id !== idToRemove;
      });
      return { ...state, items: newItems };
    }

    case 'CLEAR_COMPARE': {
      return { ...state, items: [] };
    }

    default:
      return state;
  }
};

// Провайдер контексту порівняння
export const CompareProvider = ({ children }) => {
  // Ініціалізуємо з localStorage одразу (без useEffect, без мерехтіння)
  const [state, dispatch] = useReducer(compareReducer, undefined, loadFromStorage);

  // Відстежуємо чи це перший рендер
  const isFirstRender = useRef(true);

  // Зберігаємо стан в localStorage після кожної зміни (крім першого рендеру)
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
