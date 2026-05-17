import { TextField, InputAdornment, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import CatalogSortMenu from "./CatalogSortMenu.jsx";

const CatalogToolbar = ({
  pageSearchQuery,
  setPageSearchQuery,
  isSortOpen,
  setIsSortOpen,
  sortOptions,
  sortOrder,
  setSortOrder,
  setIsFiltersOpen,
  activeFiltersCount,
  activeSidebarFilters,
  handleRemoveFilter,
  handleResetFilters
}) => {
  return (
    <div className="catalog-controls">
      {/* Пошук */}
      <div className="catalog-search">
        <TextField
          variant="outlined"
          size="small"
          className="mui-form-control"
          placeholder="Пошук у каталозі..."
          value={pageSearchQuery}
          onChange={(e) => setPageSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="search-icon" />
              </InputAdornment>
            ),
          }}
          aria-label="Search products"
        />
      </div>

      <div className="catalog-toolbar-actions">
        {/* Десктопная версия (скрыта на мобилке через CSS) */}
        <div className="toolbar-desktop-only">
          <CatalogSortMenu
            isSortOpen={isSortOpen}
            setIsSortOpen={setIsSortOpen}
            sortOptions={sortOptions}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            className="toolbar-sort"
            variant="toolbar"
          />
        </div>

        {/* Мобільна версія (капсульна пара як у Comfy) */}
        <div className="toolbar-mobile-capsules">
          <div className="sort-mobile-capsule-wrapper">
            <button 
              className={`sort-mobile-capsule ${isSortOpen ? 'is-active' : ''}`}
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <SwapVertIcon className="capsule-icon" />
              <span>{sortOptions.find(opt => opt.value === sortOrder)?.label}</span>
            </button>
            {isSortOpen && (
              <>
                <div className="sort-backdrop" onClick={() => setIsSortOpen(false)} />
                <div className="mobile-sort-wrapper">
                  <button className="mobile-sort-close-btn" onClick={() => setIsSortOpen(false)}>
                    <CloseIcon />
                  </button>
                  <div className="mobile-sort-body">
                    {sortOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`sort-item mobile-capsule ${sortOrder === option.value ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSortOrder(option.value);
                          setIsSortOpen(false);
                        }}
                      >
                        <span className="sort-item-text">{option.label}</span>
                        {sortOrder === option.value && (
                          <div className="corner-check-wrapper">
                            <CheckIcon className="corner-check-icon" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            className="filter-mobile-capsule"
            onClick={() => setIsFiltersOpen(true)}
          >
            <FilterListIcon className="capsule-icon" />
            <span>Фільтри</span>
            {activeFiltersCount > 0 && (
              <span className="filter-counter">{activeFiltersCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Активні фільтри (chips) — тепер одразу під пошуком */}
      {activeSidebarFilters && (
        <div className="active-filters-container">
          {(activeSidebarFilters.minPrice > 0 ||
            (activeSidebarFilters.maxPrice < Infinity &&
              activeSidebarFilters.maxPrice)) && (
            <Chip
              label={`Ціна: ${activeSidebarFilters.minPrice?.toLocaleString() || 0} – ${activeSidebarFilters.maxPrice !== Infinity ? activeSidebarFilters.maxPrice?.toLocaleString() : "∞"} ₴`}
              onDelete={() => handleRemoveFilter("price")}
              className="filter-chip"
            />
          )}
          {activeSidebarFilters.brands?.map((brand) => (
            <Chip
              key={`brand-${brand}`}
              label={brand}
              onDelete={() => handleRemoveFilter("brand", brand)}
              className="filter-chip"
            />
          ))}
          {activeSidebarFilters.memory?.map((mem) => (
            <Chip
              key={`mem-${mem}`}
              label={mem}
              onDelete={() => handleRemoveFilter("memory", mem)}
              className="filter-chip"
            />
          ))}
          {(activeSidebarFilters.minPrice > 0 ||
            (activeSidebarFilters.maxPrice < Infinity &&
              activeSidebarFilters.maxPrice) ||
            activeSidebarFilters.brands?.length > 0 ||
            activeSidebarFilters.memory?.length > 0) && (
            <button
              className="chips-clear-btn"
              onClick={handleResetFilters}
            >
              Очистити все
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default CatalogToolbar;
