import React from 'react';
import RecentlyViewedProducts from './RecentlyViewedProducts.jsx';

const POPULAR_TAGS = [
  'Смартфони',
  'Ноутбуки',
  'Планшети'
];

/**
 * Fallback UI component shown when a search yields zero matches.
 */
const NoSearchResults = ({ onTagClick, onProductClick, limit = 3, variant = 'grid' }) => {
  return (
    <div className="no-results-panel">
      <div className="no-results-alert">
        На жаль, за вашим запитом нічого не знайдено. Спробуйте інші ключові слова.
      </div>

      <div className="popular-tags-section">
        <div className="search-section-title">
          <span>Популярні запити</span>
        </div>
        <div className="chips-container">
          {POPULAR_TAGS.map((tag) => (
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

      <RecentlyViewedProducts onProductClick={onProductClick} limit={limit} variant={variant} />
    </div>
  );
};

export default NoSearchResults;
