import { useState, useEffect } from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Box
} from '@mui/material';
import './FilterSidebar.scss';

// Налаштування лімітів відображення
const FILTER_CONFIG = {
  initialBrandVisible: 5,     // Скільки брендів показувати одразу
  minPrice: 0,
  maxPrice: Infinity,
  debounceDelay: 300
};

// Сайдбар фільтрації: Ціна і Бренди
const FilterSidebar = ({ brands = [], categories = [], onApply, onReset }) => {
  // Локальний стан фільтрів
  const [localMinPrice, setLocalMinPrice] = useState('');
  const [localMaxPrice, setLocalMaxPrice] = useState('');
  const [localSelectedBrands, setLocalSelectedBrands] = useState([]);

  // Стан для розгортання списку брендів
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Мульти-вибір брендів (toggle)
  const handleBrandChange = (brandName) => {
    setLocalSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  // Повне очищення форми
  const handleResetClick = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalSelectedBrands([]);
    setShowAllBrands(false);
    onApply(null);
  };

  // Авто-застосування фільтрів при зміні будь-якого поля
  useEffect(() => {
    const filters = {
      minPrice: Number(localMinPrice) || 0,
      maxPrice: Number(localMaxPrice) || Infinity,
      brands: localSelectedBrands,
      categories: [],
    };
    onApply(filters);
  }, [localMinPrice, localMaxPrice, localSelectedBrands]);

  // Якщо список розгорнуто — показуємо все, інакше — ліміт
  const visibleBrands = showAllBrands
    ? brands
    : brands.slice(0, FILTER_CONFIG.initialBrandVisible);

  return (
    <aside className="filter-sidebar">
      {/* Блок ціни */}
      <div className="filter-block">
        <h3 className="filter-title">Ціна</h3>
        <Box className="mui-price-inputs">
          <TextField
            label="Від"
            variant="outlined"
            size="small"
            type="number"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="mui-form-control"
          />
          <TextField
            label="До"
            variant="outlined"
            size="small"
            type="number"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="mui-form-control"
          />
        </Box>
      </div>

      {/* Блок брендів */}
      {brands.length > 0 && (
        <div className="filter-block">
          <h3 className="filter-title">Бренд</h3>

          {/* Контейнер для скролінгу */}
          <div className={`mui-filter-list ${showAllBrands ? 'scrollable' : ''}`}>
            <FormGroup>
              {visibleBrands.map(brand => (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      checked={localSelectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                  }
                  label={brand}
                />
              ))}
            </FormGroup>
          </div>

          {/* Кнопка показу всіх брендів */}
          {brands.length > FILTER_CONFIG.initialBrandVisible && (
            <Button
              variant="text"
              onClick={() => setShowAllBrands(!showAllBrands)}
              sx={{ mt: 1, textTransform: 'none', padding: 0, minWidth: 'auto', justifyContent: 'flex-start' }}
            >
              {showAllBrands ? 'Згорнути' : `Показати всі (${brands.length})`}
            </Button>
          )}
        </div>
      )}

      {/* Блок кнопок дій */}
      <div className="filter-block">
        <Box className="mui-filter-actions">
          <Button
            variant="contained"
            onClick={handleResetClick}
          >
            Скинути
          </Button>
        </Box>
      </div>
    </aside>
  );
};

export default FilterSidebar;
