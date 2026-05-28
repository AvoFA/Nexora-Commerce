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
    const handleStorageChange = (event) => {
      if (event.key === 'recently_viewed_products') {
        updateProducts();
      }
    };

    window.addEventListener('recentlyViewedChanged', updateProducts);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('recentlyViewedChanged', updateProducts);
      window.removeEventListener('storage', handleStorageChange);
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
