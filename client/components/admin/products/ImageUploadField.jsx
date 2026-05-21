import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const ImageUploadField = ({
  imageUrl,
  onImageChange,
  label = 'Зображення товару',
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const nextImageUrl = URL.createObjectURL(file);
        onImageChange(nextImageUrl);
      }
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const nextImageUrl = URL.createObjectURL(file);
      onImageChange(nextImageUrl);
    }
  };

  return (
    <Box className="product-image-field">
      <Box className="product-form-section-heading">
        <Typography variant="h6">
          {label}
        </Typography>
        <Typography variant="body2">
          Вставте URL або оберіть локальне зображення для попереднього перегляду.
        </Typography>
      </Box>

      <div
        className={`image-upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {imageUrl ? (
          <Box className="image-preview-wrapper">
            <IconButton
              onClick={() => onImageChange('')}
              className="image-preview-remove"
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
            <img
              src={imageUrl}
              alt="Preview"
              className="image-preview"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src = 'https://placehold.co/500x300?text=No+Image';
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Зображення вибрано
            </Typography>
          </Box>
        ) : (
          <Box className="image-empty-state">
            <Typography variant="body1">
              Перетягніть зображення сюди для превʼю
            </Typography>
            <Typography variant="body2">
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

      <FormControl className="mui-form-control image-url-control" fullWidth>
        <TextField
          label="URL зображення"
          variant="outlined"
          value={imageUrl || ''}
          onChange={(event) => onImageChange(event.target.value)}
          placeholder="https://example.com/image.jpg"
          fullWidth
        />
      </FormControl>
    </Box>
  );
};

export default ImageUploadField;
