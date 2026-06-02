import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Box,
  Slider,
  InputBase,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import './FilterSidebar.scss';

const PRICE_MAX = 100000;
const BRAND_SEARCH_THRESHOLD = 5; // Show search input if brands count > 5

// Accordion component with header toggle
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="filter-block">
      <button
        className="filter-section-header"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <span className="filter-title">{title}</span>
        {isOpen
          ? <KeyboardArrowUpIcon className="section-arrow" />
          : <KeyboardArrowDownIcon className="section-arrow" />
        }
      </button>
      {isOpen && <div className="filter-section-body">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({
  brands = [],
  memoryOptions = [],
  ramOptions = [],
  activeFilters,
  onApply,
  onReset,
}) => {
  const [priceRange, setPriceRange] = useState([0, PRICE_MAX]);
  const [localSelectedBrands, setLocalSelectedBrands] = useState([]);
  const [localMemory, setLocalMemory] = useState([]);
  const [localRam, setLocalRam] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Sync state with active filters from parent
  useEffect(() => {
    if (activeFilters) {
      setPriceRange([
        activeFilters.minPrice || 0,
        activeFilters.maxPrice && activeFilters.maxPrice !== Infinity
          ? activeFilters.maxPrice
          : PRICE_MAX,
      ]);
      setLocalSelectedBrands(activeFilters.brands || []);
      setLocalMemory(activeFilters.memory || []);
      setLocalRam(activeFilters.ram || []);
    } else {
      setPriceRange([0, PRICE_MAX]);
      setLocalSelectedBrands([]);
      setLocalMemory([]);
      setLocalRam([]);
    }
  }, [activeFilters]);

  // Filter brands by search input
  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    return query ? brands.filter(b => b.name.toLowerCase().includes(query)) : brands;
  }, [brands, brandSearch]);

  const visibleBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 5);

  // Helper to propagate filter changes
  const triggerApply = useCallback((range, brands, memory, ram) => {
    onApply({
      minPrice: range[0],
      maxPrice: range[1] >= PRICE_MAX ? Infinity : range[1],
      brands,
      memory,
      ram,
      categories: [],
    });
  }, [onApply]);

  // Update local price range state on slide
  const handleSliderChange = useCallback((_, newValue) => {
    setPriceRange(newValue);
  }, []);

  // Apply filters on slider release
  const handleSliderCommit = useCallback((_, newValue) => {
    triggerApply(newValue, localSelectedBrands, localMemory, localRam);
  }, [triggerApply, localSelectedBrands, localMemory, localRam]);

  // Handle manual price input
  const handlePriceInput = useCallback((idx, raw) => {
    const val = Math.min(Math.max(Number(raw) || 0, 0), PRICE_MAX);
    setPriceRange(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    const next = [...priceRange];
    next[idx] = val;
    triggerApply(next, localSelectedBrands, localMemory, localRam);
  }, [priceRange, triggerApply, localSelectedBrands, localMemory, localRam]);

  const handleBrandChange = useCallback((brand) => {
    const next = localSelectedBrands.includes(brand)
      ? localSelectedBrands.filter(b => b !== brand)
      : [...localSelectedBrands, brand];
    setLocalSelectedBrands(next);
    triggerApply(priceRange, next, localMemory, localRam);
  }, [localSelectedBrands, priceRange, localMemory, localRam, triggerApply]);

  const handleMemoryToggle = useCallback((mem) => {
    const next = localMemory.includes(mem)
      ? localMemory.filter(m => m !== mem)
      : [...localMemory, mem];
    setLocalMemory(next);
    triggerApply(priceRange, localSelectedBrands, next, localRam);
  }, [localMemory, priceRange, localSelectedBrands, localRam, triggerApply]);

  const handleRamToggle = useCallback((ramValue) => {
    const next = localRam.includes(ramValue)
      ? localRam.filter(r => r !== ramValue)
      : [...localRam, ramValue];
    setLocalRam(next);
    triggerApply(priceRange, localSelectedBrands, localMemory, next);
  }, [localRam, priceRange, localSelectedBrands, localMemory, triggerApply]);

  const handleReset = () => {
    setPriceRange([0, PRICE_MAX]);
    setLocalSelectedBrands([]);
    setLocalMemory([]);
    setLocalRam([]);
    setBrandSearch('');
    onReset();
  };

  return (
    <aside className="filter-sidebar">

      <div className="filter-block">
        <div className="filter-section-header no-toggle">
          <span className="filter-title">Ціна</span>
        </div>
        <div className="filter-section-body">
        <div className="price-inputs-row">
          <div className="price-input-wrapper">
            <span className="price-input-label">від</span>
            <input
              className="price-input"
              type="number"
              min={0}
              max={PRICE_MAX}
              value={priceRange[0]}
              onChange={e => handlePriceInput(0, e.target.value)}
            />
            <span className="price-currency">₴</span>
          </div>
          <span className="price-divider">—</span>
          <div className="price-input-wrapper">
            <span className="price-input-label">до</span>
            <input
              className="price-input"
              type="number"
              min={0}
              max={PRICE_MAX}
              value={priceRange[1]}
              onChange={e => handlePriceInput(1, e.target.value)}
            />
            <span className="price-currency">₴</span>
          </div>
        </div>
        <Box sx={{ px: 1, mt: 1.5 }}>
          <Slider
            value={priceRange}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderCommit}
            valueLabelDisplay="auto"
            valueLabelFormat={v => `${v.toLocaleString()} ₴`}
            min={0}
            max={PRICE_MAX}
            step={1000}
            disableSwap
          />
        </Box>
        </div>
      </div>

      {brands.length > 0 && (
        <FilterSection title="Бренд">
          {brands.length > BRAND_SEARCH_THRESHOLD && (
            <div className="brand-search-wrapper">
              <SearchIcon className="brand-search-icon" />
              <InputBase
                className="brand-search-input"
                placeholder="Пошук бренду..."
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                inputProps={{ 'aria-label': 'Пошук бренду' }}
              />
            </div>
          )}

          <div className={`mui-filter-list ${showAllBrands ? 'scrollable' : ''}`}>
            <FormGroup>
              {visibleBrands.map(brand => (
                <FormControlLabel
                  key={brand.name}
                  control={
                    <Checkbox
                      checked={localSelectedBrands.includes(brand.name)}
                      onChange={() => handleBrandChange(brand.name)}
                      size="small"
                    />
                  }
                  label={
                    <div className="brand-label-content">
                      <span className="brand-name">{brand.name}</span>
                      <span className="brand-count">{brand.count}</span>
                    </div>
                  }
                />
              ))}
              {filteredBrands.length === 0 && (
                <p className="brand-not-found">Не знайдено</p>
              )}
            </FormGroup>
          </div>

          {filteredBrands.length > 5 && (
            <button
              className="show-more-btn"
              onClick={() => setShowAllBrands(prev => !prev)}
            >
              {showAllBrands ? 'Згорнути' : `Показати ще (${filteredBrands.length - 5})`}
            </button>
          )}
        </FilterSection>
      )}

      {memoryOptions.length > 0 && (
        <FilterSection title="Вбудована пам'ять" defaultOpen={false}>
          <div className="memory-grid">
            {memoryOptions.map(({ label, count }) => (
              <button
                key={label}
                className={`memory-tag ${localMemory.includes(label) ? 'active' : ''}`}
                onClick={() => handleMemoryToggle(label)}
              >
                <span className="memory-tag-label">{label}</span>
                <span className="memory-tag-count">{count}</span>
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {ramOptions.length > 0 && (
        <FilterSection title="Оперативна пам'ять" defaultOpen={false}>
          <div className="memory-grid">
            {ramOptions.map(({ label, count }) => (
              <button
                key={label}
                className={`memory-tag ${localRam.includes(label) ? 'active' : ''}`}
                onClick={() => handleRamToggle(label)}
              >
                <span className="memory-tag-label">{label}</span>
                <span className="memory-tag-count">{count}</span>
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      <div className="filter-reset-block">
        <button className="filter-reset-btn" onClick={handleReset}>
          Скинути фільтри
        </button>
      </div>

    </aside>
  );
};

export default FilterSidebar;
