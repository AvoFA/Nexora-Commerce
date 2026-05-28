import React from 'react';
import { Box, Button, FormControl, IconButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { formatPrice } from '../../../../utils/formatPrice.js';

const discountOptions = [10, 15, 20, 30, 50];

const NumberSpinners = ({ onUp, onDown }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      ml: 0.5,
      mr: -0.5,
      height: '100%',
    }}
  >
    <IconButton
      onClick={onUp}
      onMouseDown={(e) => e.preventDefault()}
      sx={{
        p: 0,
        height: 18,
        width: 18,
        color: 'rgba(255, 255, 255, 0.45)',
        '&:hover': {
          color: '#fff',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
    </IconButton>
    <IconButton
      onClick={onDown}
      onMouseDown={(e) => e.preventDefault()}
      sx={{
        p: 0,
        height: 18,
        width: 18,
        color: 'rgba(255, 255, 255, 0.45)',
        '&:hover': {
          color: '#fff',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
    </IconButton>
  </Box>
);

const parsePositiveNumber = (value, parser = parseFloat) => {
  const parsed = parser(value);

  if (parsed < 0) return 0;
  return value === '' ? '' : parsed || '';
};

const getDiscountedPrice = (price, discount) => {
  const numericPrice = Number(price || 0);

  if (numericPrice <= 0) return '';
  return Math.round(numericPrice * (1 - discount / 100));
};

const ProductPricingStockSection = ({ price, compareAtPrice, stock, errors, onChange }) => {
  const numericPrice = Number(price || 0);
  const numericCompareAtPrice = Number(compareAtPrice || 0);
  const hasDiscountPreview = numericPrice > 0 && numericCompareAtPrice > numericPrice;
  const discountAmount = hasDiscountPreview ? numericCompareAtPrice - numericPrice : 0;

  const handlePriceUp = () => {
    const currentVal = parseFloat(price) || 0;
    onChange('price', parseFloat((currentVal + 1).toFixed(2)));
  };

  const handlePriceDown = () => {
    const currentVal = parseFloat(price) || 0;
    onChange('price', parseFloat(Math.max(0, currentVal - 1).toFixed(2)));
  };

  const handleStockUp = () => {
    const currentVal = parseInt(stock, 10) || 0;
    onChange('stock', currentVal + 1);
  };

  const handleStockDown = () => {
    const currentVal = parseInt(stock, 10) || 0;
    onChange('stock', Math.max(0, currentVal - 1));
  };

  const handleApplyDiscount = (discount) => {
    const basePrice = hasDiscountPreview ? numericCompareAtPrice : numericPrice;

    if (basePrice <= 0) return;

    onChange('compareAtPrice', basePrice);
    onChange('price', getDiscountedPrice(basePrice, discount));
  };

  const handleClearDiscount = () => {
    if (hasDiscountPreview) {
      onChange('price', numericCompareAtPrice);
    }

    onChange('compareAtPrice', '');
  };

  return (
    <Box className="product-pricing-section">
      <Box className="product-form-grid product-form-grid-2">
        <FormControl className="mui-form-control" fullWidth>
          <TextField
            label="Ціна"
            type="number"
            variant="outlined"
            value={price}
            onChange={(event) => onChange('price', parsePositiveNumber(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
                event.preventDefault();
              }
            }}
            inputProps={{ min: 0, step: 'any' }}
            InputProps={{
              startAdornment: (
                <Box
                  sx={{
                    mr: 0.8,
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    userSelect: 'none',
                  }}
                >
                  ₴
                </Box>
              ),
              endAdornment: <NumberSpinners onUp={handlePriceUp} onDown={handlePriceDown} />,
            }}
            error={!!errors.price}
            helperText={errors.price}
            required
          />
        </FormControl>

        <FormControl className="mui-form-control" fullWidth>
          <TextField
            label="Кількість (Stock)"
            type="number"
            variant="outlined"
            value={stock}
            onChange={(event) => onChange('stock', parsePositiveNumber(event.target.value, (value) => parseInt(value, 10)))}
            onKeyDown={(event) => {
              if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
                event.preventDefault();
              }
            }}
            inputProps={{ min: 0, step: 1 }}
            InputProps={{
              endAdornment: <NumberSpinners onUp={handleStockUp} onDown={handleStockDown} />,
            }}
            error={!!errors.stock}
            helperText={errors.stock}
            required
          />
        </FormControl>
      </Box>

      <Box className="product-discount-section">
        <div className="product-discount-header">
          <div>
            <h6>Знижка</h6>
            <p>Швидкі кнопки застосовують знижку до поточної ціни товару.</p>
          </div>
          <Button
            type="button"
            size="small"
            variant="text"
            disabled={!compareAtPrice}
            onClick={handleClearDiscount}
          >
            Очистити
          </Button>
        </div>

        <FormControl className="mui-form-control" fullWidth>
          <TextField
            label="Стара ціна"
            type="number"
            variant="outlined"
            value={compareAtPrice}
            onChange={(event) => onChange('compareAtPrice', parsePositiveNumber(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
                event.preventDefault();
              }
            }}
            inputProps={{ min: 0, step: 'any' }}
            error={!!errors.compareAtPrice}
            helperText={errors.compareAtPrice || 'Заповнюйте тільки якщо потрібно показати знижку.'}
          />
        </FormControl>

        <div className="product-discount-quick-actions">
          <span>Швидко:</span>
          {discountOptions.map((discount) => (
            <button
              key={discount}
              type="button"
              onClick={() => handleApplyDiscount(discount)}
              disabled={numericPrice <= 0}
            >
              -{discount}%
            </button>
          ))}
        </div>

        {hasDiscountPreview && (
          <div className="product-discount-preview">
            <span className="discount-old-price">{formatPrice(numericCompareAtPrice)}</span>
            <span className="discount-current-price">{formatPrice(numericPrice)}</span>
            <span className="discount-badge">-{formatPrice(discountAmount)}</span>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default ProductPricingStockSection;
