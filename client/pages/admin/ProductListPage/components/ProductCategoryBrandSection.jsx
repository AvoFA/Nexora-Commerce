import React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  TextField,
} from '@mui/material';
import BrandSelector from '../../../../components/admin/products/BrandSelector.jsx';

const ProductCategoryBrandSection = ({
  category,
  brand,
  categories,
  availableBrands,
  errors,
  showAddBrandField,
  newBrandName,
  onChange,
  onAddBrandClick,
  onCancelAddBrand,
  onAddNewBrand,
  onNewBrandNameChange,
}) => (
  <Box className="product-form-grid product-form-grid-2">
    <FormControl className="mui-form-control" sx={{ flex: 1 }}>
      <Autocomplete
        options={categories}
        getOptionLabel={(option) => option.description || ''}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        value={categories.find((cat) => cat.name === category) || null}
        onChange={(event, newValue) => {
          onChange('category', newValue ? newValue.name : '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Категорія"
            required
          />
        )}
        noOptionsText="Нічого не знайдено"
      />
    </FormControl>

    <Box sx={{ flex: 1 }}>
      {showAddBrandField ? (
        <div className="form-field-group">
          <FormControl className="mui-form-control" fullWidth>
            <TextField
              label="Новий бренд"
              value={newBrandName}
              onChange={(event) => onNewBrandNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onAddNewBrand(newBrandName);
                } else if (event.key === 'Escape') {
                  onCancelAddBrand();
                }
              }}
              error={!!errors.newBrand}
              helperText={errors.newBrand}
              fullWidth
              autoFocus
            />
          </FormControl>
          <Box className="product-brand-actions">
            <Button
              variant="contained"
              onClick={() => onAddNewBrand(newBrandName)}
              disabled={!newBrandName.trim()}
              size="small"
              fullWidth
            >
              Додати
            </Button>
            <Button
              variant="outlined"
              onClick={onCancelAddBrand}
              size="small"
              fullWidth
            >
              Скасувати
            </Button>
          </Box>
        </div>
      ) : (
        <BrandSelector
          brands={availableBrands}
          value={brand}
          onChange={(value) => onChange('brand', value)}
          onAddNewBrandClick={onAddBrandClick}
          error={errors.brand}
        />
      )}
    </Box>
  </Box>
);

export default ProductCategoryBrandSection;
