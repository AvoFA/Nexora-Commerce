import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Renders a list of recent search queries.
 */
const SearchHistory = ({ history = [], onSelect, onDelete, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="search-history-section">
      <div className="search-section-title">
        <span>Історія пошуку</span>
        <button type="button" className="clear-btn" onClick={onClear}>
          Очистити все
        </button>
      </div>
      <div className="chips-container">
        {history.map((query) => (
          <div
            key={query}
            className="chip-item"
            onClick={() => onSelect(query)}
          >
            <span>{query}</span>
            <button
              type="button"
              className="delete-chip-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(query);
              }}
              aria-label={`Видалити ${query} з історії`}
            >
              <CloseIcon style={{ fontSize: 14 }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
