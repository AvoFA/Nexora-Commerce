import React from 'react';
import { IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice.js';

const ProductRow = ({ product, onEdit, onDelete }) => (
  <tr>
    <td className="hidden-mobile">
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
    <td className="product-name-cell">{product.name}</td>
    <td className="hidden-mobile hidden-tablet">
      <span className="category-badge">
        {product.category}
      </span>
    </td>
    <td>{formatPrice(product.price)}</td>
    <td>
      <span className="stock-badge in-stock">
        В наявності: {product.stock} шт.
      </span>
    </td>
    <td className="actions-cell">
      <IconButton size="small" onClick={() => onEdit(product)}>
        <Edit fontSize="inherit" />
      </IconButton>
      <IconButton size="small" className="danger" onClick={() => onDelete(product)}>
        <Delete fontSize="inherit" />
      </IconButton>
    </td>
  </tr>
);

export default ProductRow;
