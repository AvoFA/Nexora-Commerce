import React from 'react';
import { Box, Typography, IconButton, Pagination } from '@mui/material';
import {
  Edit,
  Delete
} from '@mui/icons-material';
import { formatPrice } from '../../../utils/formatPrice.js';
import '../../../styles/_common.scss';
import '../../../styles/_mui-theme.scss';
import '../../../styles/_admin.scss';


const ProductTable = ({
  products,
  sortConfig,
  page,
  perPage,
  totalPages,
  onSort,
  onEdit,
  onDelete,
  onPageChange
}) => {
  // Розрахунок даних для поточної сторінки
  const totalProducts = products.length;
  const startIndex = (page - 1) * perPage;
  const currentProducts = products.slice(startIndex, startIndex + perPage);

  // Мобильная версия - показуем карточки
  const mobileView = (
    <div className="admin-mobile-products">
      {currentProducts.map((product) => (
        <div key={product.id} className="admin-product-card">
          <div className="product-card-header">
            <img
              src={product.image || product.imageUrl}
              alt={product.name}
              className="mobile-product-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/60x60?text=No+Image';
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
              <span className="stock-badge in-stock">В наявності: {product.stock} шт.</span>
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
      ))}
    </div>
  );

  return (
    <div className="admin-solid-card">
      {/* Мобильная версия - карточки */}
      <div className="mobile-only-view">
        {mobileView}
      </div>

      {/* Десктопная версия - таблица */}
      <div className="desktop-only-view">
        <Box sx={{ overflowX: 'auto' }}>
          <table className="admin-table">
          <thead>
            <tr>
              <th className="hidden-mobile img-cell">Зображення</th>
              <th className="sortable-header" onClick={() => onSort('name')}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  Назва
                  {sortConfig.key === 'name' && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
              <th className="sortable-header hidden-mobile hidden-tablet" onClick={() => onSort('category')}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  Категорія
                  {sortConfig.key === 'category' && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
              <th className="sortable-header" onClick={() => onSort('price')}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  Ціна
                  {sortConfig.key === 'price' && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
              <th className="sortable-header" onClick={() => onSort('stock')}>
                <span style={{ whiteSpace: 'nowrap' }}>
                  Наявність (Stock)
                  {sortConfig.key === 'stock' && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
              <th className="actions-cell">Дії</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan={window.innerWidth < 768 ? "4" : window.innerWidth < 1024 ? "5" : "5"}
                    style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  Немає даних для відображення
                </td>
              </tr>
            ) : (
              currentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="hidden-mobile">
                    <img
                      src={product.image || product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/48x48?text=No+Image';
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
              ))
            )}
          </tbody>
        </table>
      </Box>
        </div>

      {/* Блок пагінації */}
      {totalPages > 1 && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 3,
          mb: 1,
          px: 1,
          position: 'relative'
        }}>
          {/* Інформація про кількість записів */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              position: 'absolute',
              left: 10,
              display: { xs: 'none', md: 'block' }
            }}
          >
            Показано {startIndex + 1}-{Math.min(startIndex + perPage, totalProducts)} з {totalProducts}
          </Typography>

          {/* Пагінація по центру */}
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => {
                      onPageChange(value);
                      window.scrollTo(0, 0);
                    }}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
        </Box>
      )}
    </div>
  );
};

export default ProductTable;