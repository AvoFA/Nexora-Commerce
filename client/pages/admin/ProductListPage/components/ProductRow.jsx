import React from 'react';
import { Delete, Edit } from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice.js';
import { highlightMatch } from './productUi.js';
import StockInlineEditor from '@/components/admin/common/StockInlineEditor';

const ProductRow = ({ product, searchTerm, onEdit, onDelete, onUpdateStock }) => {
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
          <span className="product-row-name">{highlightMatch(product.name, searchTerm)}</span>
          {product.brand && <span className="product-row-brand">{highlightMatch(product.brand, searchTerm)}</span>}
        </div>
      </td>
      <td className="hidden-mobile hidden-tablet">
        <span className="category-badge">
          {highlightMatch(product.category, searchTerm)}
        </span>
      </td>
      <td className="product-price-cell">{formatPrice(product.price)}</td>
      <td>
        <StockInlineEditor
          initialStock={product.stock ?? 0}
          onSave={async (newStock) => {
            await onUpdateStock(product.id, newStock);
          }}
        />
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
