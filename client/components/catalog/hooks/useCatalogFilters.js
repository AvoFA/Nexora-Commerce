export const useCatalogFilters = () => {
  // застосовуємо бокові фільтри до товарів
  const applySidebarFilters = (products, filters) => {
    let filtered = [...products];

    // фільтруємо за брендом
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    // фільтруємо за категорією
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // фільтруємо за діапазоном цін
    if (typeof filters.minPrice === 'number' && typeof filters.maxPrice === 'number') {
      filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    }

    return filtered;
  };

  // розраховуємо доступні бренди для поточного контексту
  const calculateAvailableBrands = (products, category) => {
    const brands = category === 'all'
      ? products.map(p => p.brand)
      : products.filter(p => p.category === category).map(p => p.brand);

    return [...new Set(brands)].filter(Boolean);
  };

  return {
    applySidebarFilters,
    calculateAvailableBrands
  };
};
