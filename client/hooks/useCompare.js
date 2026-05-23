import { useContext } from 'react';
import { CompareContext } from '../context/CompareContext.jsx';

export const useCompare = () => {
  const context = useContext(CompareContext);
  
  if (!context) {
    throw new Error('useCompare повинен використовуватися всередині CompareProvider');
  }

  const { state, dispatch } = context;

  const addToCompare = (product, options = {}) => {
    dispatch({ type: 'ADD_ITEM', payload: product, anchor: options.anchor || null });
  };

  const removeFromCompare = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const clearCompare = () => {
    dispatch({ type: 'CLEAR_COMPARE' });
  };

  // Перевірка чи товар вже в списку порівняння
  const isCompared = (productId) => {
    return state.items.some(item => item._id === productId || item.id === productId);
  };

  return {
    compareItems: state.items,
    compareCount: state.items.length,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isCompared
  };
};
