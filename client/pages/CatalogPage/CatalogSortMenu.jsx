import SwapVertIcon from "@mui/icons-material/SwapVert";
import CheckIcon from "@mui/icons-material/Check";

const CatalogSortMenu = ({
  isSortOpen,
  setIsSortOpen,
  sortOptions,
  sortOrder,
  setSortOrder,
  className = "",
  variant = "toolbar"
}) => {
  return (
    <div className={`catalog-sort-picker ${className}`}>
      <span className="sort-label">Сортувати:</span>
      <div className="sort-trigger-wrapper">
        <button 
          className={`sort-trigger ${isSortOpen ? 'is-active' : ''}`}
          onClick={() => setIsSortOpen(!isSortOpen)}
        >
          <SwapVertIcon className="sort-icon" />
          <span className="sort-text">
            {sortOptions.find(opt => opt.value === sortOrder)?.label}
          </span>
        </button>
        {isSortOpen && (
          <div className="sort-menu">
            {sortOptions.map(option => (
              <div 
                key={option.value}
                className={`sort-item ${sortOrder === option.value ? 'is-selected' : ''}`}
                onClick={() => {
                  setSortOrder(option.value);
                  setIsSortOpen(false);
                }}
              >
                {variant === "header" ? (
                  <>
                    <span>{option.label}</span>
                    {sortOrder === option.value && (
                      <CheckIcon className="selected-check" />
                    )}
                  </>
                ) : (
                  <div className="sort-item-content">
                    <div className="check-placeholder">
                      {sortOrder === option.value && <CheckIcon className="selected-check" />}
                    </div>
                    <span className="sort-item-text">{option.label}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogSortMenu;
