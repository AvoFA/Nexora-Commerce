import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, FormControl, IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';

/**
 * Компонент для загрузки изображений с drag & drop
 */
const ImageUploadField = ({
  imageUrl,
  onImageChange,
  label = "Зображення товару"
}) => {
  const [dragActive, setDragActive] = useState(false);

  // Обработчики drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        onImageChange(imageUrl);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {label}
        </Typography>
      </Box>

      <div
        className={`image-upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {imageUrl ? (
          <Box sx={{ textAlign: 'center', position: 'relative', display: 'inline-block' }}>
            <IconButton
              onClick={() => onImageChange('')}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'error.main',
                color: 'white'
              }}
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                maxWidth: '500px',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/500x300?text=No+Image';
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Зображення вибрано
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Перетягніть зображення сюди (Прев'ю)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              або
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span">
                Обрати файл
              </Button>
            </label>
          </Box>
        )}
      </div>

      {/* Текстове поле для вводу URL зображення */}
      <FormControl className="mui-form-control" sx={{ mt: 2 }} fullWidth>
        <TextField
          label="Або введіть URL зображення"
          variant="outlined"
          value={imageUrl || ''}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          fullWidth
        />
      </FormControl>
    </Box>
  );
};

export default ImageUploadField;
