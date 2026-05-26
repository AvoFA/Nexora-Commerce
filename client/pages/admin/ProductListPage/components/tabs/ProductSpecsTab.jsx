import React from 'react';
import { Box } from '@mui/material';
import ProductAttributesSection from '../ProductAttributesSection.jsx';

const ProductSpecsTab = ({
  attributes,
  onAddGroup,
  onRemoveGroup,
  onGroupNameChange,
  onAddItem,
  onRemoveItem,
  onItemChange,
}) => {
  return (
    <Box className="product-tab-content product-specs-tab">
      <ProductAttributesSection
        attributes={attributes}
        onAddGroup={onAddGroup}
        onRemoveGroup={onRemoveGroup}
        onGroupNameChange={onGroupNameChange}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onItemChange={onItemChange}
      />
    </Box>
  );
};

export default ProductSpecsTab;
