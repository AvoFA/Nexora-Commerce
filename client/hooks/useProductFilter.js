import { useState } from 'react';

// Custom hook for basic search and category product filtering
export const useProductFilter = (products = [], brands = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

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
    availableBrands: brands, // Return all brands directly
    setSearchTerm,
    setCategory,
    filterProducts
  };
};
