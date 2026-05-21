import React from 'react';
import {
  Autocomplete,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Paper,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const BrandSelector = ({
  brands = [],
  value = '',
  onChange,
  onAddNewBrandClick,
  label = 'Бренд',
  error = '',
}) => {
  const brandNames = React.useMemo(() => brands.map((b) => b.name), [brands]);

  return (
    <FormControl className="mui-form-control" fullWidth error={!!error}>
      <Autocomplete
        value={value || null}
        onChange={(event, newValue) => {
          onChange(newValue || '');
        }}
        options={brandNames}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={!!error}
            required
          />
        )}
        PaperComponent={({ children, ...other }) => (
          <Paper {...other}>
            {children}
            <Divider sx={{ my: 0.5, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Button
              fullWidth
              variant="text"
              size="small"
              startIcon={<AddIcon />}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onAddNewBrandClick();
              }}
              sx={{
                color: 'primary.main',
                justifyContent: 'flex-start',
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Додати новий бренд
            </Button>
          </Paper>
        )}
        noOptionsText="Нічого не знайдено"
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default BrandSelector;
