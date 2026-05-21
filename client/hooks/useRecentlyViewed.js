import { useState, useEffect, useCallback } from 'react';
import { 
  getRecentlyViewed, 
  clearRecentlyViewed as clearStorage,
  removeRecentlyViewed as removeStorage
} from '../utils/recentlyViewed.utils.js';

/**
 * Hook for managing recently viewed products state.
 * @returns {Object} { products, clearRecentlyViewed, removeRecentlyViewed }
 */
export const useRecentlyViewed = () => {
  const [products, setProducts] = useState(getRecentlyViewed());

  const updateProducts = useCallback(() => {
    setProducts(getRecentlyViewed());
  }, []);

  useEffect(() => {
    // Listen for changes in localStorage across components
    window.addEventListener('recentlyViewedChanged', updateProducts);
    
    // Also listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'recently_viewed_products') {
        updateProducts();
      }
    });

    return () => {
      window.removeEventListener('recentlyViewedChanged', updateProducts);
      window.removeEventListener('storage', updateProducts);
    };
  }, [updateProducts]);

  const clearRecentlyViewed = useCallback(() => {
    clearStorage();
    setProducts([]);
  }, []);

  const removeRecentlyViewed = useCallback((productId) => {
    removeStorage(productId);
    updateProducts();
  }, [updateProducts]);

  return {
    products,
    clearRecentlyViewed,
    removeRecentlyViewed
  };
};
