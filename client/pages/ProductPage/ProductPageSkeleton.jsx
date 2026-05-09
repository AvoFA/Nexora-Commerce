import React from 'react';
import { Skeleton, Box, Grid } from '@mui/material';
import './ProductPage.scss';

const ProductPageSkeleton = () => {
  return (
    <div>
      {/* Кнопка назад */}
      <Box sx={{ my: 1.5, width: 200 }}>
        <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      </Box>

      {/* Основний контейнер */}
      <div className="product-page-container">

        {/* ліва колонка - галерея */}
        <div className="product-image-gallery">
          <Skeleton
            variant="rectangular"
            height={500}
            sx={{ borderRadius: 2, width: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)' }}
          />
        </div>

        {/* права колонка - деталі */}
        <div className="product-details">
          <div className="product-header">
            {/* Заголовок */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="rounded" height={60} width="70%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
              <Skeleton variant="circular" width={50} height={50} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)' }} />
            </Box>

            {/* Бейджі */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 5, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 5, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 5, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            </Box>
          </div>

          {/* Ціна */}
          <Skeleton variant="rounded" height={60} width="30%" sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Опис */}
          <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
            <Skeleton variant="text" height={24} width="100%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
            <Skeleton variant="text" height={24} width="95%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
            <Skeleton variant="text" height={24} width="90%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
            <Skeleton variant="text" height={24} width="60%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
          </Box>

          {/* Кнопки дій */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 5 }}>
            <Skeleton variant="rounded" height={50} sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
            <Skeleton variant="rounded" height={50} sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
          </Box>

          {/* Характеристики */}
          <div className="attributes-list">
            <Skeleton variant="text" height={40} width="40%" sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, p: 3 }}>
               {[1, 2, 3, 4, 5].map((item) => (
                 <Box key={item} sx={{ display: 'flex', justifyContent: 'space-between', py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                   <Skeleton variant="text" width="30%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
                   <Skeleton variant="text" width="20%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
                 </Box>
               ))}
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
