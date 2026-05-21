import React from 'react';
import { IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice.js';

const ProductMobileCard = ({ product, onEdit, onDelete }) => (
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
        <span className="mobile-category">{product.category}</span>
      </div>
    </div>
    <div className="product-card-details">
      <div className="mobile-price">{formatPrice(product.price)}</div>
      <div className="mobile-stock">
        <span className="stock-badge in-stock">
          В наявності: {product.stock} шт.
        </span>
      </div>
    </div>
    <div className="product-card-actions">
      <IconButton size="small" onClick={() => onEdit(product)} className="edit-btn">
        <Edit />
      </IconButton>
      <IconButton size="small" onClick={() => onDelete(product)} className="delete-btn">
        <Delete />
      </IconButton>
    </div>
  </div>
);

export default ProductMobileCard;
