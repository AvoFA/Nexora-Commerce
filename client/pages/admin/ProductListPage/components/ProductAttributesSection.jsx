import React from 'react';
import AttributesManager from '../../../../components/admin/products/AttributesManager.jsx';

const ProductAttributesSection = ({
  attributes,
  onAddAttribute,
  onUpdateAttribute,
  onRemoveAttribute,
}) => (
  <AttributesManager
    attributes={attributes}
    onAddAttribute={onAddAttribute}
    onUpdateAttribute={onUpdateAttribute}
    onRemoveAttribute={onRemoveAttribute}
  />
);

export default ProductAttributesSection;
