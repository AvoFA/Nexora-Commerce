// Intelligent catalog search functionality

// Search relevance weights and configuration
const SEARCH_CONFIG = {
  nameWeight: 10,        // Title weight
  brandWeight: 7,        // Brand weight
  categoryWeight: 5,     // Category weight
  autoSwitchThreshold: 0.5  // Auto-switch threshold
};

export const useCatalogSearch = () => {
  // Calculate keyword relevance score for a product
  const calculateSearchScore = (product, query) => {
    let score = 0;
    const queryWords = query.split(' ').filter(word => word.length > 0);

    for (const word of queryWords) {
      // Title matches
      if (product.name && product.name.toLowerCase().includes(word)) {
        score += SEARCH_CONFIG.nameWeight;
      }
      // Brand matches
      if (product.brand && product.brand.toLowerCase().includes(word)) {
        score += SEARCH_CONFIG.brandWeight;
      }
      // Category matches
      if (product.category && product.category.toLowerCase().includes(word)) {
        score += SEARCH_CONFIG.categoryWeight;
      }
    }

    return score;
  };

  // Perform query search and rank by relevance score
  const performIntelligentSearch = (products, query) => {
    const normalizedQuery = query.toLowerCase();

    // Map search scores, filter matches, sort descending, and strip temp fields
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

  // Determine if active category filter should switch based on search results
  const shouldAutoSwitchCategory = (searchResults, currentCategory) => {
    if (searchResults.length === 0 || currentCategory === 'all') {
      return { shouldSwitch: false, targetCategory: null };
    }

    // Group match count by category
    const categoryCounts = {};
    searchResults.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });

    // Find the category containing the most matching products
    let topCategory = null;
    let maxCount = 0;
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topCategory = category;
      }
    }

    // Switch category if a single category exceeds the threshold
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
