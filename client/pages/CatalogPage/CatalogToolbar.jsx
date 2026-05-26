import { useState } from "react";
import { Chip } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CatalogSortMenu from "./CatalogSortMenu.jsx";

const getProductsWord = (count) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "товарів";
  if (lastDigit === 1) return "товар";
  if (lastDigit >= 2 && lastDigit <= 4) return "товари";
  return "товарів";
};

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
  handleResetFilters,
  filteredProductsCount,
  currentPage,
}) => {
  const [isChipsExpanded, setIsChipsExpanded] = useState(false);

  // Збір активних фільтрів у єдиний список чипсів
  const chips = [];
  if (activeSidebarFilters) {
    if (
      activeSidebarFilters.minPrice > 0 ||
      (activeSidebarFilters.maxPrice < Infinity && activeSidebarFilters.maxPrice)
    ) {
      chips.push({
        type: "price",
        label: `Ціна: ${activeSidebarFilters.minPrice?.toLocaleString() || 0} – ${activeSidebarFilters.maxPrice !== Infinity ? activeSidebarFilters.maxPrice?.toLocaleString() : "∞"} ₴`,
        onDelete: () => handleRemoveFilter("price"),
      });
    }
    activeSidebarFilters.brands?.forEach((brand) => {
      chips.push({
        type: "brand",
        value: brand,
        label: `Бренд: ${brand}`,
        onDelete: () => handleRemoveFilter("brand", brand),
      });
    });
    activeSidebarFilters.memory?.forEach((mem) => {
      chips.push({
        type: "memory",
        value: mem,
        label: `Пам'ять: ${mem}`,
        onDelete: () => handleRemoveFilter("memory", mem),
      });
    });
    activeSidebarFilters.ram?.forEach((ramVal) => {
      chips.push({
        type: "ram",
        value: ramVal,
        label: `ОЗУ: ${ramVal}`,
        onDelete: () => handleRemoveFilter("ram", ramVal),
      });
    });
  }

  const hasMoreChips = chips.length > 4;
  const visibleChips = hasMoreChips && !isChipsExpanded ? chips.slice(0, 4) : chips;

  return (
    <div className="catalog-controls">

      <div className="toolbar-left-content">
        <div className="toolbar-summary">
          <div className="products-count">
            {filteredProductsCount} {getProductsWord(filteredProductsCount)}
          </div>
          <div className="page-number">сторінка {currentPage}</div>
        </div>

        {chips.length > 0 && (
          <div className="active-filters-container">
            {visibleChips.map((chip, index) => (
              <Chip
                key={`${chip.type}-${chip.value || index}`}
                label={chip.label}
                onDelete={chip.onDelete}
                onClick={chip.onDelete}
                className="filter-chip"
              />
            ))}

            {hasMoreChips && !isChipsExpanded && (
              <button
                className="chips-toggle-btn"
                onClick={() => setIsChipsExpanded(true)}
              >
                Показати більше <KeyboardArrowDownIcon className="toggle-icon" />
              </button>
            )}

            {hasMoreChips && isChipsExpanded && (
              <>
                <button
                  className="chips-clear-btn"
                  onClick={handleResetFilters}
                >
                  Очистити всі
                </button>
                <button
                  className="chips-toggle-btn"
                  onClick={() => setIsChipsExpanded(false)}
                >
                  Сховати <KeyboardArrowUpIcon className="toggle-icon" />
                </button>
              </>
            )}

            {!hasMoreChips && (
              <button
                className="chips-clear-btn"
                onClick={handleResetFilters}
              >
                Очистити всі
              </button>
            )}
          </div>
        )}
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


    </div>
  );
};

export default CatalogToolbar;
