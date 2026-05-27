export const useCatalogFilters = () => {
  // Apply sidebar filters to products
  const applySidebarFilters = (products, filters) => {
    let filtered = [...products];

    // Filter by brand
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    // Filter by category
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Filter by price range
    if (typeof filters.minPrice === 'number' && typeof filters.maxPrice === 'number') {
      filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    }

    // Filter by storage capacity (checking name/description/specs)
    if (filters.memory && filters.memory.length > 0) {
      filtered = filtered.filter(p => {
        const text = `${p.name} ${p.description} ${p.specs ? JSON.stringify(p.specs) : ''}`.toLowerCase();
        return filters.memory.some(mem => text.includes(mem.toLowerCase()));
      });
    }

    // Filter by RAM capacity
    if (filters.ram && filters.ram.length > 0) {
      filtered = filtered.filter(p => {
        const text = `${p.name} ${p.description} ${p.specs ? JSON.stringify(p.specs) : ''}`.toLowerCase();
        return filters.ram.some(ramVal => {
          const valClean = ramVal.toLowerCase().replace(/\s+/g, '');
          const valEnglish = valClean.replace('гб', 'gb');
          const textClean = text.replace(/\s+/g, '');
          return textClean.includes(valClean) || textClean.includes(valEnglish);
        });
      });
    }

    return filtered;
  };

  // Calculate available brands and their counts for active category
  const calculateAvailableBrands = (products, category) => {
    const targetProducts = category === 'all'
      ? products
      : products.filter(p => p.category === category);

    const counts = {};
    targetProducts.forEach(p => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });

    // Return sorted brand list with counts
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  return {
    applySidebarFilters,
    calculateAvailableBrands
  };
};
