import { useState } from 'react';

// Хук для фільтрації товарів: пошук та категорії
export const useProductFilter = (products = [], brands = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  // Фільтрація товарів
  const filterProducts = (products) => {
    return products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  return {
    searchTerm,
    category,
    availableBrands: brands, // Просто повертаємо всі brands
    setSearchTerm,
    setCategory,
    filterProducts
  };
};
