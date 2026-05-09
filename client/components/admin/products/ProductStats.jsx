import React from 'react';
import {
  Inventory,
  Category as CategoryIcon,
  Warehouse,
} from '@mui/icons-material';


const ProductStats = ({ products, categories, searchTerm }) => {
  // Фільтрація товарів перед підрахунком
  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Обчислення статистики
  const totalProducts = filteredProducts.length;
  const totalCategories = [...new Set(filteredProducts.map(p => p.category))].length;
  const totalStock = filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

  return (
    <div className="products-stats-mini">
      {/* Загальна кількість товарів */}
      <div className="stat-mini-card">
        <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #3A86FF, #214D8A)' }}>
          <Inventory sx={{ fontSize: 32 }} />
        </div>
        <div className="stat-content">
          <p className="stat-value">{totalProducts}</p>
          <p className="stat-label">Всього товарів</p>
        </div>
      </div>

      {/* Кількість категорій */}
      <div className="stat-mini-card">
        <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #8338EC, #5A189A)' }}>
          <CategoryIcon sx={{ fontSize: 32 }} />
        </div>
        <div className="stat-content">
          <p className="stat-value">{totalCategories}</p>
          <p className="stat-label">Категорій</p>
        </div>
      </div>

      {/* Складські запаси */}
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
