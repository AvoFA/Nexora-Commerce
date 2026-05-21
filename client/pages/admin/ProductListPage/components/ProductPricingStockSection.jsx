import React from 'react';
import { Box, FormControl } from '@mui/material';
import TextField from '@mui/material/TextField';

const ProductPricingStockSection = ({ price, stock, errors, onChange }) => (
  <Box className="product-form-grid product-form-grid-2">
    <FormControl className="mui-form-control" fullWidth>
      <TextField
        label="Ціна"
        type="number"
        variant="outlined"
        value={price}
        onChange={(event) => {
          const value = event.target.value;
          onChange('price', value === '' ? '' : parseFloat(value) || '');
        }}
        InputProps={{
          endAdornment: <Box sx={{ ml: 1 }}>₴</Box>,
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
          onChange('stock', value === '' ? '' : parseInt(value) || '');
        }}
        error={!!errors.stock}
        helperText={errors.stock}
        required
      />
    </FormControl>
  </Box>
);

export default ProductPricingStockSection;
