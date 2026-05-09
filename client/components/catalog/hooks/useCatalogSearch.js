// Пошук товарів - розумно та просто

// Налаштування ранжирування результатів пошуку
const SEARCH_CONFIG = {
  nameWeight: 10,        // назва товару важливіша за все
  brandWeight: 7,        // бренд теж важить добре
  categoryWeight: 5,     // категорія менш релевантна
  autoSwitchThreshold: 0.5  // автоперехід в іншу категорію якщо більшість товарів звідти
};

export const useCatalogSearch = () => {
  // вираховуємо релевантність товару для пошукового запиту
  const calculateSearchScore = (product, query) => {
    let score = 0;
    const queryWords = query.split(' ').filter(word => word.length > 0);

    for (const word of queryWords) {
      // спочатку шукаємо по назві - вона важливіша за все
      if (product.name && product.name.toLowerCase().includes(word)) {
        score += SEARCH_CONFIG.nameWeight;
      }
      // далі бренд - теж важливо
      if (product.brand && product.brand.toLowerCase().includes(word)) {
        score += SEARCH_CONFIG.brandWeight;
      }
      // категорія менш значима
      if (product.category && product.category.toLowerCase().includes(word)) {
        score += SEARCH_CONFIG.categoryWeight;
      }
    }

    return score;
  };

  // розумний пошук з урахуванням релевантності
  const performIntelligentSearch = (products, query) => {
    const normalizedQuery = query.toLowerCase();

    // присвоюємо кожному товару пошуковий рейтинг, сортуємо, забираємо службові поля
    const scoredResults = products
      .map(product => ({
        ...product,
        searchScore: calculateSearchScore(product, normalizedQuery)
      }))
      .filter(product => product.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore)
      .map(({ searchScore, ...product }) => product);

    return {
      products: scoredResults,
      totalResults: scoredResults.length,
      query
    };
  };

  // перевіряємо чи варто автоматично переключитися в іншу категорію
  const shouldAutoSwitchCategory = (searchResults, currentCategory) => {
    if (searchResults.length === 0 || currentCategory === 'all') {
      return { shouldSwitch: false, targetCategory: null };
    }

    // групуємо знайдені товари по категоріях
    const categoryCounts = {};
    searchResults.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });

    // шукаємо категорію з найбільшою кількістю результатів
    let topCategory = null;
    let maxCount = 0;
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topCategory = category;
      }
    }

    // автоматично переключаємося на цю категорію якщо більшість знайденого звідти
    const shouldSwitch = topCategory &&
      topCategory !== currentCategory &&
      maxCount > searchResults.length * SEARCH_CONFIG.autoSwitchThreshold;

    return {
      shouldSwitch,
      targetCategory: shouldSwitch ? topCategory : null
    };
  };

  return {
    performIntelligentSearch,
    calculateSearchScore,
    shouldAutoSwitchCategory
  };
};
