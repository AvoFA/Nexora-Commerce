import { useState, useEffect } from 'react';
import { getProducts } from '../../../services/productService.js';
import { getCategories } from '../../../services/categoryService.js';

export const useCatalogData = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data on mount
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Load products and categories in parallel
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      setAllProducts(productsData);

      // Add default "all products" option
      const allProductsOption = { value: 'all', label: 'Усі товари' };
      const categoryOptions = categoriesData.map(cat => ({
        value: cat.name,
        label: cat.description
      }));

      setAvailableCategories([allProductsOption, ...categoryOptions]);
    } catch (err) {
      console.error('[Catalog::Error] Fetch failed:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    allProducts,
    availableCategories,
    isLoading,
    error,
    refetchData: fetchData
  };
};
