import React from 'react';
import { Box } from '@mui/material';
import ProductEmptyState from './ProductEmptyState.jsx';
import ProductMobileCard from './ProductMobileCard.jsx';
import ProductPagination from './ProductPagination.jsx';
import ProductRow from './ProductRow.jsx';

const SortableHeader = ({ label, sortKey, sortConfig, onSort, className = '' }) => (
  <th className={`sortable-header ${className}`.trim()} onClick={() => onSort(sortKey)}>
    <span className="product-sort-label">
      {label}
      {sortConfig.key === sortKey && (
        <span style={{ marginLeft: '4px' }}>
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </span>
  </th>
);

const ProductTable = ({
  products,
  sortConfig,
  page,
  perPage,
  totalPages,
  totalProducts,
  startIndex,
  onSort,
  onEdit,
  onDelete,
  onPageChange,
}) => (
  <div className="admin-solid-card">
    <div className="mobile-only-view">
      <div className="admin-mobile-products">
        {products.map((product) => (
          <ProductMobileCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>

    <div className="desktop-only-view">
      <Box sx={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th className="hidden-mobile img-cell">Зображення</th>
              <SortableHeader
                label="Назва"
                sortKey="name"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <SortableHeader
                label="Категорія"
                sortKey="category"
                sortConfig={sortConfig}
                onSort={onSort}
                className="hidden-mobile hidden-tablet"
              />
              <SortableHeader
                label="Ціна"
                sortKey="price"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <SortableHeader
                label="Наявність (Stock)"
                sortKey="stock"
                sortConfig={sortConfig}
                onSort={onSort}
              />
              <th className="actions-cell">Дії</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <ProductEmptyState />
            ) : (
              products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </Box>
    </div>

    <ProductPagination
      page={page}
      perPage={perPage}
      totalPages={totalPages}
      totalProducts={totalProducts}
      startIndex={startIndex}
      onPageChange={onPageChange}
    />
  </div>
);

export default ProductTable;
