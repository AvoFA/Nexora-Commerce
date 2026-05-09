import React from 'react';
import {
  Box, Typography, Button, IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField';

/**
 * Компонент для управления характеристиками товара
 */
const AttributesManager = ({
  attributes,
  onAddAttribute,
  onUpdateAttribute,
  onRemoveAttribute
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Характеристики товару
        </Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={onAddAttribute}>
          Додати
        </Button>
      </Box>

      {attributes.map((attr, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <div className="mui-form-control" style={{ flex: 1 }}>
            <TextField
              label="Назва"
              size="small"
              value={attr.key}
              onChange={(e) => onUpdateAttribute(index, 'key', e.target.value)}
              placeholder="Наприклад: Розмір екрану"
              fullWidth
            />
          </div>
          <div className="mui-form-control" style={{ flex: 1 }}>
            <TextField
              label="Значення"
              size="small"
              value={attr.value}
              onChange={(e) => onUpdateAttribute(index, 'value', e.target.value)}
              placeholder="Наприклад: 6.1 дюймів"
              fullWidth
            />
          </div>
          <IconButton
            color="error"
            onClick={() => onRemoveAttribute(index)}
            sx={{ mt: 1 }}
          >
            <DeleteOutline />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default AttributesManager;
