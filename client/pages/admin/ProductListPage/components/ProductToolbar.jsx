import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

const ProductToolbar = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
}) => (
  <div className="admin-solid-card filter-card">
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
      <FormControl className="mui-form-control" sx={{ flexGrow: 1 }}>
        <TextField
          placeholder="Пошук товарів..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Search sx={{ color: 'text.secondary' }} />
              </Box>
            ),
          }}
        />
      </FormControl>

      <FormControl
        variant="outlined"
        size="small"
        className="mui-form-control"
        sx={{ width: { xs: '100%', md: '200px' } }}
      >
        <InputLabel shrink>Категорія</InputLabel>
        <Select
          label="Категорія"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
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

export default ProductToolbar;
