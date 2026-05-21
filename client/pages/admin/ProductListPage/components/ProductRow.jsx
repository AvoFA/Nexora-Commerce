import React from 'react';
import { Delete, Edit } from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice.js';
import { getProductStockState } from './productUi.js';

const ProductRow = ({ product, onEdit, onDelete }) => {
  const stockState = getProductStockState(product.stock);

  return (
    <tr>
      <td className="product-thumb-cell">
        <img
          src={product.image || product.imageUrl}
          alt={product.name}
          className="product-image"
          onError={(event) => {
            event.target.onerror = null;
            event.target.src = 'https://placehold.co/48x48?text=No+Image';
          }}
        />
      </td>
      <td className="product-name-cell">
        <div className="product-row-main">
          <span className="product-row-name">{product.name}</span>
          {product.brand && <span className="product-row-brand">{product.brand}</span>}
        </div>
      </td>
      <td className="hidden-mobile hidden-tablet">
        <span className="category-badge">
          {product.category}
        </span>
      </td>
      <td className="product-price-cell">{formatPrice(product.price)}</td>
      <td>
        <span className={`stock-badge stock-${stockState.key}`}>
          <span>{stockState.label}</span>
          <small>{stockState.detail}</small>
        </span>
      </td>
      <td className="actions-cell">
        <button
          type="button"
          className="product-action-button edit"
          onClick={() => onEdit(product)}
          title="Редагувати товар"
        >
          <Edit fontSize="inherit" />
        </button>
        <button
          type="button"
          className="product-action-button danger"
          onClick={() => onDelete(product)}
          title="Видалити товар"
        >
          <Delete fontSize="inherit" />
        </button>
      </td>
    </tr>
  );
};

export default ProductRow;
