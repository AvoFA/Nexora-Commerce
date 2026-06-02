const MEMORY_LABELS = ['64 ГБ', '128 ГБ', '256 ГБ', '512 ГБ', '1 ТБ'];
const RAM_LABELS = ['4 ГБ', '6 ГБ', '8 ГБ', '12 ГБ', '16 ГБ', '32 ГБ'];

const RAM_CONTEXT_PATTERN = /(озу|ram|оператив)/i;
const STORAGE_CONTEXT_PATTERN = /(вбудован|сховище|накопич|storage|rom|пам['’]?ять|memory)/i;

const getAttributeEntries = (product) => {
  if (!Array.isArray(product.attributes)) return [];

  return product.attributes.flatMap((group) => (
    Array.isArray(group.items)
      ? group.items.map((item) => ({
        context: [group.groupName, item.key].filter(Boolean).join(' '),
        value: item.value || '',
      }))
      : []
  ));
};

const getProductAttributeText = (product) => {
  const attributeText = getAttributeEntries(product)
    .flatMap((entry) => [entry.context, entry.value])
    .filter(Boolean)
    .join(' ');

  return [
    product.name,
    product.description,
    product.specs ? JSON.stringify(product.specs) : '',
    attributeText,
  ].filter(Boolean).join(' ');
};

const normalizeCapacityText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/гігабайт(и|ів)?/g, 'гб')
    .replace(/gigabyte(s)?/g, 'gb')
    .replace(/терабайт(и|ів)?/g, 'тб')
    .replace(/terabyte(s)?/g, 'tb')
    .replace(/\s+/g, ' ')
    .trim();

const buildCapacityPatterns = (label) => {
  const normalized = normalizeCapacityText(label);
  const numeric = normalized.match(/\d+/)?.[0];

  if (!numeric) return [normalized];

  const isTerabyte = normalized.includes('тб') || normalized.includes('tb');
  const units = isTerabyte ? ['тб', 'tb'] : ['гб', 'gb'];

  return units.flatMap((unit) => [
    `${numeric} ${unit}`,
    `${numeric}${unit}`,
  ]);
};

const textMatchesCapacity = (text, label) => {
  const normalizedText = normalizeCapacityText(text);
  const patterns = buildCapacityPatterns(label);

  return patterns.some((pattern) => {
    const normalizedPattern = normalizeCapacityText(pattern);
    const numeric = normalizedPattern.match(/\d+/)?.[0];
    const unit = normalizedPattern.includes('тб') || normalizedPattern.includes('tb')
      ? '(тб|tb)'
      : '(гб|gb)';

    if (!numeric) {
      return normalizedText.includes(normalizedPattern);
    }

    const capacityRegex = new RegExp(`(^|[^0-9])${numeric}\\s*${unit}(?![0-9])`, 'i');
    return capacityRegex.test(normalizedText);
  });
};

const getContextualCapacityText = (product, type) => {
  const entries = getAttributeEntries(product);
  const matchedValues = entries
    .filter((entry) => {
      if (type === 'ram') {
        return RAM_CONTEXT_PATTERN.test(entry.context);
      }

      return STORAGE_CONTEXT_PATTERN.test(entry.context)
        && !RAM_CONTEXT_PATTERN.test(entry.context);
    })
    .map((entry) => entry.value)
    .filter(Boolean);

  return matchedValues.join(' ');
};

const productMatchesCapacity = (product, label, type) => {
  const contextualText = getContextualCapacityText(product, type);

  if (contextualText) {
    return textMatchesCapacity(contextualText, label);
  }

  return textMatchesCapacity(getProductAttributeText(product), label);
};

const getProductsForCategory = (products, category) =>
  category === 'all'
    ? products
    : products.filter((product) => product.category === category);

const calculateCapacityOptions = (products, category, labels, type) => {
  const targetProducts = getProductsForCategory(products, category);

  return labels
    .map((label) => ({
      label,
      count: targetProducts.filter((product) => productMatchesCapacity(product, label, type)).length,
    }))
    .filter((option) => option.count > 0);
};

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

    if (filters.memory && filters.memory.length > 0) {
      filtered = filtered.filter(p =>
        filters.memory.some(mem => productMatchesCapacity(p, mem, 'memory')),
      );
    }

    if (filters.ram && filters.ram.length > 0) {
      filtered = filtered.filter(p =>
        filters.ram.some(ramVal => productMatchesCapacity(p, ramVal, 'ram')),
      );
    }

    return filtered;
  };

  // Calculate available brands and their counts for active category
  const calculateAvailableBrands = (products, category) => {
    const targetProducts = getProductsForCategory(products, category);

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
    calculateAvailableBrands,
    calculateAvailableMemoryOptions: (products, category) =>
      calculateCapacityOptions(products, category, MEMORY_LABELS, 'memory'),
    calculateAvailableRamOptions: (products, category) =>
      calculateCapacityOptions(products, category, RAM_LABELS, 'ram'),
  };
};
