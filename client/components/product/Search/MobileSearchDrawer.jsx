import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { searchProducts } from '../../../services/productService.js';
import SearchHistory from './SearchHistory.jsx';
import RecentlyViewedProducts from './RecentlyViewedProducts.jsx';
import NoSearchResults from './NoSearchResults.jsx';
import ProductCard from '../../catalog/ProductCard/ProductCard.jsx';
import {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearSearchHistory
} from './historyUtils.js';

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
 * Fullscreen mobile search drawer contents.
 */
const MobileSearchDrawer = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(getHistory());

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let isCurrent = true;
    setLoading(true);
    searchProducts(debouncedQuery).then((data) => {
      if (isCurrent) {
        setResults(data.slice(0, 8));
        setLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, [debouncedQuery]);

  const handleSearchSubmit = (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    addToHistory(term);
    onClose();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (productName) => {
    if (productName) addToHistory(productName);
    onClose();
  };

  return (
    <div className="mobile-search-panel">
      <div className="mobile-search-panel__header">
        <form
          className="mobile-search-form"
          onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}
        >
          <div className="search-input-container">
            <input
              ref={inputRef}
              type="text"
              className="search-input-field"
              placeholder="Я шукаю..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="search-input-actions">
              {query && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setQuery('')}
                  aria-label="Очистити"
                >
                  <CloseIcon style={{ fontSize: 18 }} />
                </button>
              )}
              {query && <span className="search-divider" />}
              <button
                type="submit"
                className="search-submit-btn"
                aria-label="Знайти"
              >
                <SearchIcon style={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        </form>
        <button
          type="button"
          className="mobile-search-close-btn"
          onClick={onClose}
          aria-label="Закрити"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="mobile-search-panel__body">
        {!query.trim() && (
          <>
            <SearchHistory
              history={history}
              onSelect={(q) => { setQuery(q); handleSearchSubmit(q); }}
              onDelete={(q) => setHistory(removeFromHistory(q))}
              onClear={() => setHistory(clearSearchHistory())}
            />
            <RecentlyViewedProducts onProductClick={() => handleProductClick('')} limit={3} variant="mobile-stacked" />
          </>
        )}

        {query.trim() && loading && (
          <div className="search-section-title">Шукаємо товари...</div>
        )}

        {query.trim() && !loading && results.length > 0 && (
          <div className="search-results-list-wrapper">
            <div className="search-suggestions-row">
              <div className="chips-container">
                {getSuggestions(query, results).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip-item suggestion-chip"
                    onClick={() => { setQuery(s); handleSearchSubmit(s); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-section-title">Товари</div>
            <div className="mobile-search-results-stacked">
              {results.slice(0, 3).map((product) => (
                <div
                  key={product.id || product._id}
                  onClick={() => handleProductClick(product.name)}
                  className="grid-card-wrapper"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mobile-search-view-all-btn"
              onClick={() => handleSearchSubmit()}
            >
              <span className="view-all-btn-text">
                <span>Переглянути</span>
                <span>всі товари</span>
              </span>
              <div className="view-all-arrow-circle">
                <ArrowForwardIcon />
              </div>
            </button>
          </div>
        )}

        {query.trim() && !loading && results.length === 0 && (
          <NoSearchResults
            onTagClick={(tag) => { setQuery(tag); handleSearchSubmit(tag); }}
            onProductClick={() => handleProductClick('')}
            limit={3}
            variant="mobile-stacked"
          />
        )}
      </div>
    </div>
  );
};

export default MobileSearchDrawer;
