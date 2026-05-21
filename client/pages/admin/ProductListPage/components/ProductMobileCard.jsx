import React from 'react';
import { Delete, Edit } from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice.js';
import { getProductStockState } from './productUi.js';

const ProductMobileCard = ({ product, onEdit, onDelete, onUpdateStock }) => {
  const stockState = getProductStockState(product.stock);

  return (
    <div className="admin-product-card">
      <div className="product-card-header">
        <img
          src={product.image || product.imageUrl}
          alt={product.name}
          className="mobile-product-image"
          onError={(event) => {
            event.target.onerror = null;
            event.target.src = 'https://placehold.co/60x60?text=No+Image';
          }}
        />
        <div className="product-info">
          <h4 className="mobile-product-name">{product.name}</h4>
          <div className="mobile-product-meta">
            <span>{product.category}</span>
            {product.brand && <span>{product.brand}</span>}
          </div>
        </div>
      </div>
      <div className="product-card-details">
        <div className="mobile-price">{formatPrice(product.price)}</div>
        <div className="product-stock-inline-edit">
          <button
            type="button"
            className="stock-inline-btn decrease"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStock(product.id, Math.max(0, Number(product.stock || 0) - 1));
            }}
            disabled={Number(product.stock || 0) <= 0}
            title="Зменшити залишок"
          >
            –
          </button>
          <span className={`stock-badge stock-${stockState.key}`}>
            <span>{stockState.label}</span>
            <small>{stockState.detail}</small>
          </span>
          <button
            type="button"
            className="stock-inline-btn increase"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStock(product.id, Number(product.stock || 0) + 1);
            }}
            title="Збільшити залишок"
          >
            +
          </button>
        </div>
      </div>
      <div className="product-card-actions">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="product-action-button edit"
        >
          <Edit fontSize="inherit" />
          Редагувати
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="product-action-button danger"
        >
          <Delete fontSize="inherit" />
          Видалити
        </button>
      </div>
    </div>
  );
};

export default ProductMobileCard;
