import React from 'react';
import { Box, Pagination, Typography } from '@mui/material';

const ProductPagination = ({
  page,
  perPage,
  totalPages,
  totalProducts,
  startIndex,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      mt: 3,
      mb: 1,
      px: 1,
      position: 'relative',
    }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          position: 'absolute',
          left: 10,
          display: { xs: 'none', md: 'block' },
        }}
      >
        Показано {startIndex + 1}-{Math.min(startIndex + perPage, totalProducts)} з {totalProducts}
      </Typography>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => {
          onPageChange(value);
          window.scrollTo(0, 0);
        }}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default ProductPagination;
