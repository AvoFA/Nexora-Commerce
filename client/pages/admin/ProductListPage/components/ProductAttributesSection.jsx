import React from 'react';
import AttributesManager from '../../../../components/admin/products/AttributesManager.jsx';

const ProductAttributesSection = ({
  attributes,
  onAddAttribute,
  onUpdateAttribute,
  onRemoveAttribute,
}) => (
  <div className="product-attributes-section">
    <AttributesManager
      attributes={attributes}
      onAddAttribute={onAddAttribute}
      onUpdateAttribute={onUpdateAttribute}
      onRemoveAttribute={onRemoveAttribute}
    />
  </div>
);

export default ProductAttributesSection;
