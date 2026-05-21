import { Category as CategoryIcon, Smartphone } from "@mui/icons-material";

const CategoryStats = ({ categories, totalProducts }) => {
  return (
    <div className="products-stats-mini category-stats-overview">
      <div className="stat-mini-card stat-primary">
        <div className="stat-icon-wrapper">
          <CategoryIcon sx={{ fontSize: 32 }} />
        </div>
        <div className="stat-content">
          <p className="stat-value">{categories.length}</p>
          <p className="stat-label">Загальна кількість категорій</p>
        </div>
      </div>

      <div className="stat-mini-card stat-secondary">
        <div className="stat-icon-wrapper">
          <Smartphone sx={{ fontSize: 32 }} />
        </div>
        <div className="stat-content">
          <p className="stat-value">{totalProducts}</p>
          <p className="stat-label">Загальна кількість товарів</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryStats;
