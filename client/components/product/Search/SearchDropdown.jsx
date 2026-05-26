import React from 'react';
import SearchHistory from './SearchHistory.jsx';
import RecentlyViewedProducts from './RecentlyViewedProducts.jsx';
import NoSearchResults from './NoSearchResults.jsx';
import { useRecentlyViewed } from '../../../hooks/useRecentlyViewed.js';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ProductCard from '../../catalog/ProductCard/ProductCard.jsx';

// Helper to extract suggestions dynamically from database product names
const getSuggestions = (query, results) => {
  if (!query.trim()) return [];
  const suggestions = [query.trim()];

  results.forEach((product) => {
    const words = product.name.split(' ');
    // Take first 2 words for clean suggestion tags
    const shortName = words.slice(0, 2).join(' ');
    if (
      shortName &&
      !suggestions.some((s) => s.toLowerCase() === shortName.toLowerCase())
    ) {
      suggestions.push(shortName);
    }
  });

  return suggestions.slice(0, 5); // Max 5 chips
};

/**
 * Handles rendering logic for search dropdown contents.
 */
const SearchDropdown = ({
  query,
  loading,
  results,
  history,
  onSelectResult,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
  onTagClick
}) => {
  const { products: recentlyViewed } = useRecentlyViewed();

  const handleProductClick = (product) => {
    onSelectResult(product.name);
  };

  // 1. Empty query state: History & Recently Viewed
  if (!query.trim()) {
    const hasHistory = history && history.length > 0;
    const hasRecentlyViewed = recentlyViewed && recentlyViewed.length > 0;

    if (!hasHistory && !hasRecentlyViewed) {
      return (
        <div className="search-dropdown-menu">
          <div className="popular-tags-section">
            <div className="search-section-title">Популярні запити</div>
            <div className="chips-container">
              {['Смартфони', 'Ноутбуки', 'Планшети'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="chip-item"
                  onClick={() => onTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="search-dropdown-menu">
        <SearchHistory
          history={history}
          onSelect={onSelectHistory}
          onDelete={onDeleteHistory}
          onClear={onClearHistory}
        />
        <RecentlyViewedProducts onProductClick={() => onSelectResult('')} />
      </div>
    );
  }

  // 2. Loading state
  if (loading) {
    return (
      <div className="search-dropdown-menu">
        <div className="search-section-title">Шукаємо товари...</div>
      </div>
    );
  }

  // 3. Live results state
  if (results.length > 0) {
    const suggestions = getSuggestions(query, results);

    return (
      <div className="search-dropdown-menu">
        {suggestions.length > 0 && (
          <div className="search-suggestions-row">
            <div className="chips-container">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip-item suggestion-chip"
                  onClick={() => onTagClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="search-section-title">Результати пошуку</div>
        <div className="search-results-grid">
          {results.slice(0, 2).map((product) => (
            <div
              key={product.id || product._id}
              onClick={() => handleProductClick(product)}
              className="grid-card-wrapper"
            >
              <ProductCard product={product} />
            </div>
          ))}

          <button
            type="button"
            className="view-all-results-card"
            onClick={() => onTagClick(query)}
          >
            <span className="view-all-text">Переглянути всі товари</span>
            <div className="view-all-circle-arrow">
              <ArrowForwardIcon style={{ fontSize: 20 }} />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 4. No results found state
  return (
    <div className="search-dropdown-menu">
      <NoSearchResults
        onTagClick={onTagClick}
        onProductClick={() => onSelectResult('')}
      />
    </div>
  );
};

export default SearchDropdown;
