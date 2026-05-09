import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ErrorOutline } from '@mui/icons-material';
import './NotFoundPage.scss';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box className="not-found-container">
      <div className="not-found-content">
        <div className="icon-wrapper">
          <ErrorOutline sx={{ fontSize: 80, color: '#ff6b6b' }} />
        </div>

        <Typography variant="h1" className="error-code">
          404
        </Typography>

        <Typography variant="h4" className="error-title">
          Сторінку не знайдено
        </Typography>

        <Typography variant="body1" className="error-description">
          Вибачте, але сторінка, яку ви шукаєте, не існує або була переміщена.
        </Typography>

        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          className="home-button"
        >
          На головну
        </Button>
      </div>
    </Box>
  );
};

export default NotFoundPage;
