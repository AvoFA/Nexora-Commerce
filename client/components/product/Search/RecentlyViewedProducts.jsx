import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '../../../hooks/useRecentlyViewed.js';
import { formatPrice } from '../../../utils/formatPrice.js';
import ProductCard from '../../catalog/ProductCard/ProductCard.jsx';

/**
 * Renders a compact layout of recently viewed products.
 */
const RecentlyViewedProducts = ({ onProductClick, limit = 3, variant = 'grid' }) => {
  const { products } = useRecentlyViewed();

  if (!products || products.length === 0) return null;

  const showGrid = variant === 'grid';
  const isMobileStacked = variant === 'mobile-stacked';
  const displayProducts = products.slice(0, limit);

  return (
    <div className="search-recently-viewed-section">
      <div className="search-section-title recently-viewed-header">
        <span>{isMobileStacked ? "Переглянуті товари" : "Нещодавно переглянуті"}</span>
        {showGrid && (
          <Link to="/account/viewed" className="view-all-link" onClick={onProductClick}>
            Всі переглянуті товари &gt;
          </Link>
        )}
        {isMobileStacked && (
          <Link to="/account/viewed" className="view-all-link-mobile" onClick={onProductClick}>
            <span>Усі</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
            </svg>
          </Link>
        )}
      </div>
      <div className={showGrid ? "recently-viewed-grid" : (isMobileStacked ? "mobile-search-results-stacked" : "recently-viewed-carousel")}>
        {displayProducts.map((product) => {
          if (showGrid || isMobileStacked) {
            return (
              <div key={product.id || product._id} onClick={onProductClick} className="grid-card-wrapper">
                <ProductCard product={product} />
              </div>
            );
          }
          return (
            <Link
              key={product.id || product._id}
              to={`/product/${product.id || product._id}`}
              className="carousel-item"
              onClick={onProductClick}
            >
              <div className="item-image">
                <img
                  src={product.image || '/assets/images/placeholder.svg'}
                  alt={product.name}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.onerror = null;
                    e.target.src = '/assets/images/placeholder.svg';
                  }}
                />
              </div>
              <div className="item-title" title={product.name}>
                {product.name}
              </div>
              <div className="item-price">{formatPrice(product.price)}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyViewedProducts;
