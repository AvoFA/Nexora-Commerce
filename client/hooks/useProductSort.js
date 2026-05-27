import { useState } from 'react';

// Custom hook to sort product list
export const useProductSort = () => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });

  // Handle table header click
  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  // Sort product array
  const sortProducts = (products) => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Numeric sorting for price and stock
      if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // Case-insensitive alphabetical sorting for strings
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
