import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField';

const AttributesManager = ({
  attributes,
  onAddAttribute,
  onUpdateAttribute,
  onRemoveAttribute,
}) => {
  return (
    <Box>
      <Box className="product-attributes-header">
        <div>
          <Typography variant="h6">
            Характеристики товару
          </Typography>
          <p>Заповнюються вручну або з атрибутів обраної категорії.</p>
        </div>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddAttribute}
          className="product-add-attribute-btn"
        >
          Додати
        </Button>
      </Box>

      <div className="product-attributes-list">
        {attributes.map((attr, index) => (
          <Box key={index} className="product-attribute-row">
            <div className="mui-form-control">
              <TextField
                label="Назва"
                size="small"
                value={attr.key}
                onChange={(event) => onUpdateAttribute(index, 'key', event.target.value)}
                placeholder="Наприклад: Розмір екрана"
                fullWidth
              />
            </div>
            <div className="mui-form-control">
              <TextField
                label="Значення"
                size="small"
                value={attr.value}
                onChange={(event) => onUpdateAttribute(index, 'value', event.target.value)}
                placeholder="Наприклад: 6.1 дюймів"
                fullWidth
              />
            </div>
            <IconButton
              color="error"
              onClick={() => onRemoveAttribute(index)}
              className="product-remove-attribute-btn"
            >
              <DeleteOutline />
            </IconButton>
          </Box>
        ))}
      </div>
    </Box>
  );
};

export default AttributesManager;
