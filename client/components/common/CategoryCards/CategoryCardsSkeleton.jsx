import { Skeleton } from '@mui/material';
import './CategoryCards.scss';

const CategoryCardsSkeleton = () => {
  return (
    <section className="category-cards-section">
      <div className="category-cards-container">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            variant="rectangular"
            height={200}
            sx={{
              borderRadius: '12px',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              animation: 'wave'
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryCardsSkeleton;
