import React from 'react';
import { Backdrop, Box, Fade, Modal, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ProductBasicInfoSection from './ProductBasicInfoSection.jsx';
import ProductCategoryBrandSection from './ProductCategoryBrandSection.jsx';
import ProductPricingStockSection from './ProductPricingStockSection.jsx';
import ProductMediaSection from './ProductMediaSection.jsx';
import ProductAttributesSection from './ProductAttributesSection.jsx';
import ProductDescriptionSection from './ProductDescriptionSection.jsx';

const ProductFormModal = ({
  open,
  editingId,
  formData,
  errors,
  categories,
  availableBrands,
  showAddBrandField,
  newBrandName,
  isSaving,
  onClose,
  onChange,
  onSave,
  onAddAttribute,
  onUpdateAttribute,
  onRemoveAttribute,
  onAddBrandClick,
  onCancelAddBrand,
  onAddNewBrand,
  onNewBrandNameChange,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 250,
          className: 'admin-modal-backdrop',
        },
      }}
    >
      <Fade in={open} timeout={250}>
        <Box className="admin-modal-wrapper">
          <div className="admin-modal-card admin-solid-card product-form-modal-card">
            <button onClick={onClose} className="admin-modal-close-btn">
              <CloseIcon />
            </button>

            <div className="admin-modal-header">
              <Typography variant="h5" component="h2">
                {editingId ? 'Редагувати товар' : 'Додати новий товар'}
              </Typography>
              <p className="product-modal-subtitle">
                Дані товару, ціна, наявність, зображення та характеристики.
              </p>
            </div>

            <div className="admin-modal-content">
              <Box
                id="product-form"
                component="form"
                onSubmit={handleSubmit}
                className="product-form"
              >
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
                  stock={formData.stock}
                  errors={errors}
                  onChange={onChange}
                />

                <ProductMediaSection
                  imageUrl={formData.imageUrl}
                  onChange={onChange}
                />

                <ProductAttributesSection
                  attributes={formData.attributes}
                  onAddAttribute={onAddAttribute}
                  onUpdateAttribute={onUpdateAttribute}
                  onRemoveAttribute={onRemoveAttribute}
                />

                <ProductDescriptionSection
                  description={formData.description}
                  onChange={onChange}
                />
              </Box>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSaving}
              >
                Скасувати
              </button>
              <button
                type="submit"
                form="product-form"
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Збереження...' : 'Зберегти'}
              </button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ProductFormModal;
