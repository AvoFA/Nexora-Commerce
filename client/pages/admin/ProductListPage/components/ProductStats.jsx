import React from 'react';
import {
  Category as CategoryIcon,
  Inventory,
  ReportProblem,
  Storefront,
} from '@mui/icons-material';

const ProductStats = ({ products }) => {
  const totalProducts = products.length;
  const outOfStock = products.filter((product) => Number(product.stock || 0) <= 0).length;
  const lowStock = products.filter((product) => {
    const stock = Number(product.stock || 0);
    return stock > 0 && stock <= 5;
  }).length;
  const categoryCoverage = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].length;
  const brandCoverage = [
    ...new Set(products.map((product) => product.brand).filter(Boolean)),
  ].length;

  return (
    <div className="product-stats-overview">
      <div className="stat-mini-card stat-primary">
        <div className="stat-icon-wrapper">
          <Inventory />
        </div>
        <div className="stat-content">
          <p className="stat-value">{totalProducts}</p>
          <p className="stat-label">Всього товарів</p>
        </div>
      </div>

      <div className="stat-mini-card stat-danger">
        <div className="stat-icon-wrapper">
          <Storefront />
        </div>
        <div className="stat-content">
          <p className="stat-value">{outOfStock}</p>
          <p className="stat-label">Немає в наявності</p>
        </div>
      </div>

      <div className="stat-mini-card stat-warning">
        <div className="stat-icon-wrapper">
          <ReportProblem />
        </div>
        <div className="stat-content">
          <p className="stat-value">{lowStock}</p>
          <p className="stat-label">Низький залишок</p>
        </div>
      </div>

      <div className="stat-mini-card stat-secondary">
        <div className="stat-icon-wrapper">
          <CategoryIcon />
        </div>
        <div className="stat-content">
          <p className="stat-value">{categoryCoverage}/{brandCoverage}</p>
          <p className="stat-label">Категорії / бренди</p>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;
