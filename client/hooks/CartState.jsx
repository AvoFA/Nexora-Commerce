// Context for managing the shopping cart state

import { createContext, useReducer, useEffect } from "react";

// Create the cart context
export const CartContext = createContext();

// Reducer to manage cart state operations
const cartReducer = (state, action) => {
  let newItems;

  switch (action.type) {
    case 'ADD_ITEM': {
      const itemToAdd = action.payload;
      const existingItem = state.items.find(item => item.id === itemToAdd.id);

      if (existingItem) {
        // If item exists in cart, increment quantity and select it
        newItems = state.items.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1, selected: true } : item
        );
      } else {
        // If item is new, add it with quantity 1
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
        // Decrement quantity if greater than 1
        newItems = state.items.map(item =>
          item.id === idToRemove ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        // Remove item if quantity is 1
        newItems = state.items.filter(item => item.id !== idToRemove);
      }
      return { ...state, items: newItems };
    }

    case 'CLEAR_ITEM': {
      const idToClear = action.payload;
      // Remove item completely from the cart
      newItems = state.items.filter(item => item.id !== idToClear);
      return { ...state, items: newItems };
    }

    case 'CLEAR_CART': {
      // Clear entire cart
      return { ...state, items: [], lastAddedProductId: null, isDrawerOpen: false, addedProduct: null };
    }

    case 'CLOSE_DRAWER': {
      return { ...state, isDrawerOpen: false };
    }

    case 'LOAD_STATE': {
      // Load cart state from saved payload
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

// Initial cart state structure
const initialState = {
  items: [],
  lastAddedProductId: null,
  isDrawerOpen: false,
  addedProduct: null,
};

// Cart context provider component
export const CartProvider = ({ children }) => {
  // Use useReducer for state management
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const localData = localStorage.getItem("cartState");
      if (localData) {
        dispatch({ type: "LOAD_STATE", payload: JSON.parse(localData) });
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    }
  }, []);

  // Persist cart to localStorage when state changes
  useEffect(() => {
    try {
      if (state !== initialState) {
        localStorage.setItem("cartState", JSON.stringify(state));
      }
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [state]);

  // Expose cart state and dispatch to children
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
