import React from 'react';
import ImageUploadField from '../../../../components/admin/products/ImageUploadField.jsx';

const ProductMediaSection = ({ imageUrl, onChange }) => (
  <ImageUploadField
    imageUrl={imageUrl}
    onImageChange={(value) => onChange('imageUrl', value)}
  />
);

export default ProductMediaSection;
