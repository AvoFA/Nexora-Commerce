import React from 'react';
import ProductDescriptionSection from '../ProductDescriptionSection.jsx';

const ProductDescriptionTab = ({ description, onChange }) => {
  return (
    <div className="centered-editor-container">
      <ProductDescriptionSection description={description} onChange={onChange} />
    </div>
  );
};

export default ProductDescriptionTab;
