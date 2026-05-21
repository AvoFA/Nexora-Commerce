import React from 'react';
import {
  Button,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const BrandSelector = ({
  brands,
  value,
  onChange,
  onAddNewBrandClick,
  label = 'Бренд',
  error = '',
}) => {
  return (
    <FormControl className="mui-form-control" fullWidth error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        MenuProps={{ className: 'mui-select-menu' }}
        fullWidth
        required
      >
        {brands.map((brand) => (
          <MenuItem
            key={brand.id}
            value={brand.name}
          >
            {brand.name}
          </MenuItem>
        ))}

        <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<AddIcon />}
          onClick={(event) => {
            event.stopPropagation();
            onAddNewBrandClick();
          }}
          sx={{
            color: 'primary.main',
            justifyContent: 'flex-start',
            px: 2,
            py: 1,
          }}
        >
          Додати новий бренд
        </Button>
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default BrandSelector;
