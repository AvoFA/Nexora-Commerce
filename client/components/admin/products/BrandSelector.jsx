import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Divider, Button, FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

/**
 * Компонент для выбора бренда с кнопкой вызова в меню
 */
const BrandSelector = ({
  brands,
  value,
  onChange,
  onAddNewBrandClick,
  label = "Бренд",
  error = ''
}) => {
  return (
    <FormControl className="mui-form-control" fullWidth error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{ className: 'mui-select-menu' }}
        fullWidth
        required
      >
        {/* Обычные бренды */}
        {brands.map((brand) => (
          <MenuItem
            key={brand.id}
            value={brand.name}
          >
            {brand.name}
          </MenuItem>
        ))}

        {/* Фиксированный разделитель */}
        <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Кнопка вызова интерфейса добавления в модалке */}
        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<AddIcon />}
          onClick={(e) => {
            e.stopPropagation(); // Предотвращает закрытие меню
            onAddNewBrandClick(); // Сигнал для открытия поля в модалке
          }}
          sx={{
            color: 'primary.main',
            justifyContent: 'flex-start',
            px: 2,
            py: 1
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
