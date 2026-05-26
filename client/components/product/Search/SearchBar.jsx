import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { searchProducts } from '../../../services/productService.js';
import SearchDropdown from './SearchDropdown.jsx';
import {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearSearchHistory
} from './historyUtils.js';

/**
 * Centered desktop search bar component.
 */
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [history, setHistory] = useState(getHistory());

  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync search input query with URL search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q') || '';
    setQuery(qParam);
    setFocused(false);
  }, [location]);

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
        setResults(data.slice(0, 5));
        setLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, [debouncedQuery]);

  // Global hotkey '/' to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const active = document.activeElement.tagName;
      if (e.key === '/' && active !== 'INPUT' && active !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSearchSubmit = (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    const updatedHistory = addToHistory(term);
    setHistory(updatedHistory);
    setFocused(false);
    inputRef.current?.blur();
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < results.length) {
        const product = results[activeIndex];
        addToHistory(product.name);
        setFocused(false);
        inputRef.current?.blur();
        navigate(`/product/${product.id || product._id}`);
        setQuery('');
      } else {
        handleSearchSubmit();
      }
    }
  };

  const handleSelectResult = (name) => {
    if (name) addToHistory(name);
    setFocused(false);
    setQuery('');
  };

  return (
    <>
      <div className={`search-backdrop-dim ${focused ? 'active' : ''}`} onClick={() => setFocused(false)} />
      <div className="navbar-search-wrapper">
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder="Я шукаю..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
          />
          <div className="search-input-actions">
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => { setQuery(''); setActiveIndex(-1); inputRef.current?.focus(); }}
                aria-label="Очистити"
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            )}
            {query && <span className="search-divider" />}
            <button
              type="button"
              className="search-submit-btn"
              onClick={() => handleSearchSubmit()}
              aria-label="Знайти"
            >
              <SearchIcon style={{ fontSize: 20 }} />
            </button>
          </div>
        </div>

        {focused && (
          <SearchDropdown
            query={query}
            loading={loading}
            results={results}
            history={history}
            onSelectResult={handleSelectResult}
            onSelectHistory={(q) => { setQuery(q); handleSearchSubmit(q); }}
            onDeleteHistory={(q) => setHistory(removeFromHistory(q))}
            onClearHistory={() => setHistory(clearSearchHistory())}
            onTagClick={(tag) => { setQuery(tag); handleSearchSubmit(tag); }}
          />
        )}
      </div>
    </>
  );
};

export default SearchBar;
