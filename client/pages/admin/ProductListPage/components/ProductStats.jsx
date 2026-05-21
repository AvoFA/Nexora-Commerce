import React from 'react';
import {
  Category as CategoryIcon,
  Inventory,
  Warehouse,
} from '@mui/icons-material';

const ProductStats = ({ products }) => {
  const totalProducts = products.length;
  const totalCategories = [...new Set(products.map((product) => product.category))].length;
  const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);

  return (
    <div className="products-stats-mini">
      <div className="stat-mini-card">
        <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #3A86FF, #214D8A)' }}>
          <Inventory sx={{ fontSize: 32 }} />
        </div>
        <div className="stat-content">
          <p className="stat-value">{totalProducts}</p>
          <p className="stat-label">Всього товарів</p>
        </div>
      </div>

      <div className="stat-mini-card">
        <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #8338EC, #5A189A)' }}>
          <CategoryIcon sx={{ fontSize: 32 }} />
        </div>
        <div className="stat-content">
          <p className="stat-value">{totalCategories}</p>
          <p className="stat-label">Категорій</p>
        </div>
      </div>

      <div className="stat-mini-card">
        <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #06D6A0, #048A5F)' }}>
          <Warehouse sx={{ fontSize: 32 }} />
        </div>
        <div className="stat-content">
          <p className="stat-value">{totalStock}</p>
          <p className="stat-label">Товарів на складі</p>
        </div>
      </div>
    </div>
  );
};

export default ProductStats;
