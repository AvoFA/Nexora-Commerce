import React from 'react';
import { Box, FormControl, IconButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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

const ProductPricingStockSection = ({ price, stock, errors, onChange }) => {
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

  return (
    <Box className="product-form-grid product-form-grid-2">
      <FormControl className="mui-form-control" fullWidth>
        <TextField
          label="Ціна"
          type="number"
          variant="outlined"
          value={price}
          onChange={(event) => {
            const value = event.target.value;
            const parsed = parseFloat(value);
            if (parsed < 0) {
              onChange('price', 0);
            } else {
              onChange('price', value === '' ? '' : parsed || '');
            }
          }}
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
          onChange={(event) => {
            const value = event.target.value;
            const parsed = parseInt(value, 10);
            if (parsed < 0) {
              onChange('stock', 0);
            } else {
              onChange('stock', value === '' ? '' : parsed || '');
            }
          }}
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
  );
};

export default ProductPricingStockSection;
