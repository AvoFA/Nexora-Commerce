import React from 'react';
import { FormControl } from '@mui/material';
import TextField from '@mui/material/TextField';

const ProductBasicInfoSection = ({ name, error, onChange }) => (
  <FormControl className="mui-form-control" fullWidth>
    <TextField
      autoFocus
      label="Назва товару"
      variant="outlined"
      value={name}
      onChange={(event) => onChange('name', event.target.value)}
      error={!!error}
      helperText={error}
      required
    />
  </FormControl>
);

export default ProductBasicInfoSection;
