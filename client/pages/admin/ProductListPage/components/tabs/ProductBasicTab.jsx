import React from 'react';
import { Box } from '@mui/material';
import ProductBasicInfoSection from '../ProductBasicInfoSection.jsx';
import ProductCategoryBrandSection from '../ProductCategoryBrandSection.jsx';
import ProductPricingStockSection from '../ProductPricingStockSection.jsx';
import ProductMediaSection from '../ProductMediaSection.jsx';

const ProductBasicTab = ({
  formData,
  errors,
  categories,
  availableBrands,
  showAddBrandField,
  newBrandName,
  onChange,
  onAddBrandClick,
  onCancelAddBrand,
  onAddNewBrand,
  onNewBrandNameChange,
}) => {
  return (
    <Box className="product-tab-content product-basic-tab">
      <div className="product-basic-grid">
        <div className="product-basic-fields">
          <ProductBasicInfoSection
            name={formData.name}
            error={errors.name}
            onChange={onChange}
          />

          <ProductCategoryBrandSection
            category={formData.category}
            brand={formData.brand}
            categories={categories}
            availableBrands={availableBrands}
            errors={errors}
            showAddBrandField={showAddBrandField}
            newBrandName={newBrandName}
            onChange={onChange}
            onAddBrandClick={onAddBrandClick}
            onCancelAddBrand={onCancelAddBrand}
            onAddNewBrand={onAddNewBrand}
            onNewBrandNameChange={onNewBrandNameChange}
          />

          <ProductPricingStockSection
            price={formData.price}
            compareAtPrice={formData.compareAtPrice}
            stock={formData.stock}
            errors={errors}
            onChange={onChange}
          />
        </div>

        <div className="product-basic-media">
          <ProductMediaSection imageUrl={formData.imageUrl} onChange={onChange} />
        </div>
      </div>
    </Box>
  );
};

export default ProductBasicTab;
