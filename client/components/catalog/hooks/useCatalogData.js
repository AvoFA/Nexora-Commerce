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
    console.log('📡 fetchData почався...');
    try {
      setIsLoading(true);

      // завантажуємо товари та категорії паралельно для швидкості
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      console.log(`📊 Загружено ${productsData.length} товарів, ${categoriesData.length} категорій`);
      setAllProducts(productsData);

      // додаємо опцію "усі товари" до категорій
      const allProductsOption = { value: 'all', label: 'Усі товари' };
      const categoryOptions = categoriesData.map(cat => ({
        value: cat.name,
        label: cat.description
      }));

      setAvailableCategories([allProductsOption, ...categoryOptions]);
      console.log('✅ fetchData завершено успішно');
    } catch (err) {
      console.error('❌ Помилка fetchData:', err.message);
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
      console.log('🔄 visibilitychange triggered, hidden:', document.hidden);
      if (document.visibilityState === 'visible') {
        console.log('✅ Вкладка стала видимою - оновляю дані...');
        fetchData();
      } else {
        console.log('⏸️ Вкладка стала невидимою');
      }
    };

    console.log('🎯 listener visibilitychange доданий');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      console.log('🧹 listener visibilitychange прибрано');
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
