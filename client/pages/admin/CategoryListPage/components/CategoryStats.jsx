import { Category as CategoryIcon, Smartphone } from "@mui/icons-material";

const CategoryStats = ({ categories, totalProducts }) => {
  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card stat-primary">
        <div className="stat-card-icon">
          <CategoryIcon />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Категорії</span>
          <p className="stat-card-subtext">Активні товарні групи</p>
        </div>
        <div className="stat-card-value">{categories.length}</div>
      </div>

      <div className="admin-stat-card stat-secondary">
        <div className="stat-card-icon">
          <Smartphone />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Товари</span>
          <p className="stat-card-subtext">Загальна кількість у категоріях</p>
        </div>
        <div className="stat-card-value">{totalProducts}</div>
      </div>
    </div>
  );
};

export default CategoryStats;
