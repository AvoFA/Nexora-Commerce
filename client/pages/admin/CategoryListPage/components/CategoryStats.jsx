import {
  Category as CategoryIcon,
  Inventory2Outlined as ProductsIcon,
  TimelineOutlined as AverageIcon,
} from "@mui/icons-material";

const CategoryStats = ({ categories, totalProducts }) => {
  const categoryCount = categories.length;
  const averageProducts = categoryCount > 0
    ? Math.round(totalProducts / categoryCount)
    : 0;

  return (
    <div className="admin-stats-grid category-stats-rail">
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

      <div className="category-stats-connector" aria-hidden="true">
        <span className="connector-line" />
        <div className="category-stats-pulse">
          <AverageIcon />
          <span>{averageProducts}</span>
        </div>
        <span className="connector-label">товарів / категорія</span>
      </div>

      <div className="admin-stat-card stat-secondary">
        <div className="stat-card-icon">
          <ProductsIcon />
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
