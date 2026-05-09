import { useState } from 'react';

// Хук для сортування продуктів
export const useProductSort = () => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });

  // Обробка кліку по заголовку таблиці
  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // Функція сортування для масиву продуктів
  const sortProducts = (products) => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Для ціни та stock - числове порівняння
      if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // Для текстових полів
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  return {
    sortConfig,
    handleSort,
    sortProducts
  };
};
