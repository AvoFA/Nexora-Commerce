import React from 'react';
import { Delete, Edit } from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice.js';
import { highlightMatch } from './productUi.js';
import StockInlineEditor from '@/components/admin/common/StockInlineEditor';

const ProductMobileCard = ({ product, searchTerm, onEdit, onDelete, onUpdateStock }) => {
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
          <h4 className="mobile-product-name">{highlightMatch(product.name, searchTerm)}</h4>
          <div className="mobile-product-meta">
            <span>{highlightMatch(product.category, searchTerm)}</span>
            {product.brand && <span>{highlightMatch(product.brand, searchTerm)}</span>}
          </div>
        </div>
      </div>
      <div className="product-card-details">
        <div className="mobile-price">{formatPrice(product.price)}</div>
        <StockInlineEditor
          initialStock={product.stock ?? 0}
          onSave={async (newStock) => {
            await onUpdateStock(product.id, newStock);
          }}
        />
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
