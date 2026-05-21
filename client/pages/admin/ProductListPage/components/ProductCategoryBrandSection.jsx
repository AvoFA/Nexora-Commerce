import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import TextField from '@mui/material/TextField';
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
  <Box sx={{ display: 'flex', gap: 2 }}>
    <FormControl className="mui-form-control" sx={{ flex: 1 }}>
      <InputLabel>Категорія</InputLabel>
      <Select
        label="Категорія"
        value={category}
        onChange={(event) => onChange('category', event.target.value)}
        MenuProps={{ className: 'mui-select-menu' }}
      >
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.name}>
            {cat.description}
          </MenuItem>
        ))}
      </Select>
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
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
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
