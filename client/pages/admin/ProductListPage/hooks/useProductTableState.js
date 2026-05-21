import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PER_PAGE = 20;

export const useProductTableState = (products = [], perPage = DEFAULT_PER_PAGE) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
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
  }, [products, sortConfig]);

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesBrand = brand === 'all' || product.brand === brand;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [sortedProducts, searchTerm, category, brand]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const startIndex = (page - 1) * perPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + perPage);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [searchTerm, category, brand]);

  return {
    searchTerm,
    category,
    brand,
    page,
    perPage,
    sortConfig,
    filteredProducts,
    currentProducts,
    totalPages,
    startIndex,
    totalProducts: filteredProducts.length,
    setSearchTerm,
    setCategory,
    setBrand,
    setPage,
    handleSort,
  };
};
