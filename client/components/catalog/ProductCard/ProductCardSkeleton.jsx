import { Skeleton, Box } from '@mui/material';
import './ProductCard.scss';

const ProductCardSkeleton = () => {
  return (
    
    <div className="product-card-link" style={{ pointerEvents: 'none', backgroundColor: 'hsl(224, 46%, 12%)', borderColor: 'hsl(224, 46%, 20%)' }}>

      {/* 1. Зображення  */}
      <Box sx={{ position: 'relative', paddingTop: '75%', backgroundColor: 'rgba(255,255,255,0.03)' }}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.08)'
          }}
        />
        {/* Кружечок "улюблені" */}
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255, 255, 255, 0.15)' }}
        />
      </Box>

      {/* 2. Контент */}
      <div className="card-content">

        {/* Заголовок */}
        <Skeleton variant="rounded" height={24} width="95%" sx={{ mb: 1.5, bgcolor: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Опис */}
        <Box sx={{ mb: 2, flexGrow: 1 }}>
          <Skeleton variant="rounded" height={16} width="100%" sx={{ mb: 0.8, bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
          <Skeleton variant="rounded" height={16} width="70%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
        </Box>

        {/* Ціна */}
        <Skeleton variant="rounded" height={28} width="50%" sx={{ mb: 2.5, bgcolor: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Кнопки */}
        <div className="card-footer">
          <Skeleton variant="rounded" height={44} sx={{ flex: 1, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
          <Skeleton variant="rounded" height={44} sx={{ flex: 1, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
