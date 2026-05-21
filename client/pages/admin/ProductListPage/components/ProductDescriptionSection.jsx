import React from 'react';
import { FormControl } from '@mui/material';
import TextField from '@mui/material/TextField';

const ProductDescriptionSection = ({ description, onChange }) => (
  <FormControl className="mui-form-control" fullWidth>
    <TextField
      label="Опис товару"
      variant="outlined"
      multiline
      minRows={4}
      maxRows={10}
      value={description}
      onChange={(event) => onChange('description', event.target.value)}
    />
  </FormControl>
);

export default ProductDescriptionSection;
