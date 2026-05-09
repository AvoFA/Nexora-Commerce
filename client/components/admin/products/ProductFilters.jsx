import React from 'react';
import { Box, FormControl, TextField, InputLabel, Select, MenuItem } from '@mui/material';
import { Search } from '@mui/icons-material';
import '../../../styles/_common.scss';
import '../../../styles/_mui-theme.scss';
import '../../../styles/_admin.scss';

/**
 * Панель фільтрації: пошук та категорії
 */
const ProductFilters = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  categories
}) => {
  return (
    <div className="admin-solid-card filter-card">
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Пошук за назвою */}
        <FormControl className="mui-form-control" sx={{ flexGrow: 1 }}>
          <TextField
            placeholder="Пошук товарів..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <Search sx={{ color: 'text.secondary' }} />
                </Box>
              ),
            }}
          />
        </FormControl>



        {/* Вибір категорії */}
        <FormControl variant="outlined" size="small" className="mui-form-control" sx={{ width: { xs: '100%', md: '200px' } }}>
          <InputLabel shrink>Категорія</InputLabel>
          <Select
            label="Категорія"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            MenuProps={{ className: 'mui-select-menu' }}
            displayEmpty
          >
            <MenuItem value="all">Усі категорії</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.name}>
                {cat.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </div>
  );
};

export default ProductFilters;
