// Контекст для керування кошиком

import { createContext, useReducer, useEffect } from "react";

// Створюємо контекст кошика
export const CartContext = createContext();

// Reducer для керування станом кошика
const cartReducer = (state, action) => {
  let newItems;

  switch (action.type) {
    case 'ADD_ITEM': {
      const itemToAdd = action.payload;
      const existingItem = state.items.find(item => item.id === itemToAdd.id);

      if (existingItem) {
        // Якщо товар вже є у кошику, збільшуємо кількість та обираємо його
        newItems = state.items.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1, selected: true } : item
        );
      } else {
        // Якщо товару немає, додаємо його з кількістю 1 та обраним станом
        newItems = [...state.items, { ...itemToAdd, quantity: 1, selected: true }];
      }
      return {
        ...state,
        items: newItems,
        lastAddedProductId: itemToAdd.id,
        isDrawerOpen: true,
        addedProduct: itemToAdd
      };
    }

    case 'TOGGLE_ITEM_SELECTION': {
      const idToToggle = action.payload;
      newItems = state.items.map(item =>
        item.id === idToToggle ? { ...item, selected: !item.hasOwnProperty('selected') ? false : !item.selected } : item
      );
      return { ...state, items: newItems };
    }

    case 'REMOVE_ITEM': {
      const idToRemove = action.payload;
      const itemToRemove = state.items.find(item => item.id === idToRemove);

      if (itemToRemove.quantity > 1) {
        // Якщо товарів більше одного, зменшуємо кількість
        newItems = state.items.map(item =>
          item.id === idToRemove ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        // Якщо товар один, видаляємо його з кошика
        newItems = state.items.filter(item => item.id !== idToRemove);
      }
      return { ...state, items: newItems };
    }

    case 'CLEAR_ITEM': {
      const idToClear = action.payload;
      // Повністю видаляємо товар з кошика
      newItems = state.items.filter(item => item.id !== idToClear);
      return { ...state, items: newItems };
    }

    case 'CLEAR_CART': {
      // Очищаємо весь кошик
      return { ...state, items: [], lastAddedProductId: null, isDrawerOpen: false, addedProduct: null };
    }

    case 'CLOSE_DRAWER': {
      return { ...state, isDrawerOpen: false };
    }

    case 'LOAD_STATE': {
      // Завантажуємо збережений стан
      return {
        ...initialState,
        ...action.payload,
        isDrawerOpen: false,
        addedProduct: null
      };
    }

    default:
      return state;
  }
};

// Початковий стан кошика
const initialState = {
  items: [],
  lastAddedProductId: null,
  isDrawerOpen: false,
  addedProduct: null,
};

// Провайдер контексту кошика
export const CartProvider = ({ children }) => {
  // Використовуємо useReducer для складної логіки стану
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Завантажуємо кошик з localStorage при першому завантаженні
  useEffect(() => {
    try {
      const localData = localStorage.getItem("cartState");
      if (localData) {
        dispatch({ type: "LOAD_STATE", payload: JSON.parse(localData) });
      }
    } catch (error) {
      console.error("Не вдалося завантажити кошик з localStorage", error);
    }
  }, []);

  // Зберігаємо кошик у localStorage при зміні стану
  useEffect(() => {
    try {
      if (state !== initialState) {
        localStorage.setItem("cartState", JSON.stringify(state));
      }
    } catch (error) {
      console.error("Не вдалося зберегти кошик у localStorage", error);
    }
  }, [state]);

  // Передаємо стан та функцію dispatch дочірнім компонентам
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
