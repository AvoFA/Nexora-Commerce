import { useState, useEffect } from 'react';
import { getProducts } from '../../../services/productService.js';
import { getCategories } from '../../../services/categoryService.js';

export const useCatalogData = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // завантажуємо початкові дані при першому відкритті
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // завантажуємо товари та категорії паралельно для швидкості
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      setAllProducts(productsData);

      // додаємо опцію "усі товари" до категорій
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

  // оновлюємо дані при поверненні до вкладки відбу
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
