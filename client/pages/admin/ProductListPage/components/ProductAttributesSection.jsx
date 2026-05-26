import React from 'react';
import AttributesManager from '../../../../components/admin/products/AttributesManager.jsx';

const ProductAttributesSection = ({
  attributes,
  onAddGroup,
  onRemoveGroup,
  onGroupNameChange,
  onAddItem,
  onRemoveItem,
  onItemChange,
}) => (
  <div className="product-attributes-section">
    <AttributesManager
      attributes={attributes}
      onAddGroup={onAddGroup}
      onRemoveGroup={onRemoveGroup}
      onGroupNameChange={onGroupNameChange}
      onAddItem={onAddItem}
      onRemoveItem={onRemoveItem}
      onItemChange={onItemChange}
    />
  </div>
);

export default ProductAttributesSection;
