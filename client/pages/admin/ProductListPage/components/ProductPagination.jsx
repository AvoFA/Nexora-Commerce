import React from 'react';
import Pagination from '../../../../components/common/Pagination/Pagination.jsx';

const ProductPagination = ({
  page,
  perPage,
  totalPages,
  totalProducts,
  onPageChange,
  onPerPageChange,
}) => (
  <Pagination
    page={page}
    totalPages={totalPages}
    total={totalProducts}
    limit={perPage}
    limitOptions={[10, 20, 50]}
    itemLabel="товарів"
    onPageChange={onPageChange}
    onLimitChange={onPerPageChange}
    showLimitSelector={!!onPerPageChange}
  />
);

export default ProductPagination;
