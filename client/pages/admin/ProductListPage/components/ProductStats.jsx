import React, { useRef, useState } from 'react';
import {
  CheckCircle,
  Edit,
  FilterList,
  Inventory,
  ReportProblem,
  Storefront,
} from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice.js';

const LOW_STOCK_THRESHOLD = 5;

const LowStockPopover = ({ products, onEditProduct }) => {
  const lowStockProducts = products
    .filter((p) => Number(p.stock || 0) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
    .slice(0, 8);

  if (lowStockProducts.length === 0) {
    return (
      <div className="low-stock-popover">
        <p className="low-stock-popover__empty">Усі товари мають достатній залишок</p>
      </div>
    );
  }

  return (
    <div className="low-stock-popover">
      <div className="low-stock-popover__header">
        <span className="low-stock-popover__title">Критичний залишок</span>
        <span className="low-stock-popover__count">{lowStockProducts.length}</span>
      </div>
      <ul className="low-stock-popover__list">
        {lowStockProducts.map((product) => {
          const stock = Number(product.stock || 0);
          const stockClass = stock === 0 ? 'out' : 'low';
          return (
            <li key={product.id} className="low-stock-popover__item">
              <img
                src={product.image || product.imageUrl}
                alt={product.name}
                className="low-stock-popover__img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/36x36?text=?';
                }}
              />
              <div className="low-stock-popover__info">
                <span className="low-stock-popover__name">{product.name}</span>
                <span className="low-stock-popover__price">{formatPrice(product.price)}</span>
              </div>
              <span className={`low-stock-popover__badge low-stock-popover__badge--${stockClass}`}>
                {stock === 0 ? 'Немає' : `${stock} шт`}
              </span>
              <button
                type="button"
                className="low-stock-popover__edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProduct(product);
                }}
                title="Редагувати товар"
              >
                <Edit style={{ fontSize: 14 }} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ProductStats = ({ products, lowStockFilterActive, onToggleLowStockFilter, onEditProduct }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const hideTimerRef = useRef(null);

  const totalProducts = products.length;
  const inStock = products.filter((p) => Number(p.stock || 0) > 0).length;
  const outOfStock = products.filter((p) => Number(p.stock || 0) <= 0).length;
  const lowStock = products.filter((p) => {
    const s = Number(p.stock || 0);
    return s > 0 && s <= LOW_STOCK_THRESHOLD;
  }).length;

  const handleMouseEnter = () => {
    clearTimeout(hideTimerRef.current);
    setPopoverVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => setPopoverVisible(false), 180);
  };

  return (
    <div className="product-stats-overview">
      {/* Total */}
      <div className="stat-mini-card stat-primary">
        <div className="stat-icon-wrapper">
          <Inventory />
        </div>
        <div className="stat-content">
          <p className="stat-label">Всього товарів</p>
          <p className="stat-value">{totalProducts}</p>
        </div>
      </div>

      {/* In stock */}
      <div className="stat-mini-card stat-info">
        <div className="stat-icon-wrapper">
          <CheckCircle />
        </div>
        <div className="stat-content">
          <p className="stat-label">В наявності</p>
          <p className="stat-value">{inStock}</p>
        </div>
      </div>

      {/* Out of stock */}
      <div className="stat-mini-card stat-danger">
        <div className="stat-icon-wrapper">
          <Storefront />
        </div>
        <div className="stat-content">
          <p className="stat-label">Немає в наявності</p>
          <p className="stat-value">{outOfStock}</p>
        </div>
      </div>

      {/* Low stock — with popover */}
      <div
        className={`stat-mini-card stat-warning stat-low-stock-card is-clickable${lowStockFilterActive ? ' stat-low-stock-card--active' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onToggleLowStockFilter}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggleLowStockFilter()}
        title={lowStockFilterActive ? 'Скасувати фільтр' : 'Фільтрувати за низьким залишком'}
      >
        <div className="stat-icon-wrapper">
          <ReportProblem />
        </div>
        <div className="stat-content">
          <p className="stat-label">Низький залишок</p>
          <p className="stat-value">{lowStock}</p>
        </div>
        {lowStockFilterActive && (
          <span className="stat-filter-badge">
            <FilterList style={{ fontSize: 13 }} />
          </span>
        )}

        {/* Popover anchored to this card */}
        {popoverVisible && (
          <div
            className="low-stock-popover-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => e.stopPropagation()}
          >
            <LowStockPopover products={products} onEditProduct={onEditProduct} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductStats;
