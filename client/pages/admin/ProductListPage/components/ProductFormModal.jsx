import React, { useState, useEffect } from 'react';
import { Backdrop, Box, Fade, Modal, Typography } from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  DescriptionOutlined as DescIcon,
  TuneOutlined as SpecsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ProductBasicTab from './tabs/ProductBasicTab.jsx';
import ProductDescriptionTab from './tabs/ProductDescriptionTab.jsx';
import ProductSpecsTab from './tabs/ProductSpecsTab.jsx';

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
  onAddGroup,
  onRemoveGroup,
  onGroupNameChange,
  onAddItem,
  onRemoveItem,
  onItemChange,
  onAddBrandClick,
  onCancelAddBrand,
  onAddNewBrand,
  onNewBrandNameChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open) {
      setActiveTab(0);
    }
  }, [open]);

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
          <div className="admin-modal-card admin-solid-card product-form-modal-card tabbed-layout-card">
            <button onClick={onClose} className="admin-modal-close-btn">
              <CloseIcon />
            </button>

            <div className="admin-modal-header">
              <Typography variant="h5" component="h2">
                {editingId ? 'Редагувати товар' : 'Додати новий товар'}
              </Typography>
              <p className="product-modal-subtitle">
                Вкажіть загальні відомості, опис та характеристики товару.
              </p>
            </div>

            <div className="admin-modal-segmented-tabs">
              <div className="segmented-tabs-container">
                <button
                  type="button"
                  className={`segmented-tab-btn${activeTab === 0 ? ' is-active' : ''}`}
                  onClick={() => setActiveTab(0)}
                >
                  <InfoIcon fontSize="small" />
                  <span>Основна інформація</span>
                </button>
                <button
                  type="button"
                  className={`segmented-tab-btn${activeTab === 1 ? ' is-active' : ''}`}
                  onClick={() => setActiveTab(1)}
                >
                  <DescIcon fontSize="small" />
                  <span>Опис товару</span>
                </button>
                <button
                  type="button"
                  className={`segmented-tab-btn${activeTab === 2 ? ' is-active' : ''}`}
                  onClick={() => setActiveTab(2)}
                >
                  <SpecsIcon fontSize="small" />
                  <span>Характеристики</span>
                </button>
              </div>
            </div>

            <div className="admin-modal-content">
              <Box
                id="product-form"
                component="form"
                onSubmit={handleSubmit}
                className="product-form-tabbed-layout"
              >
                {activeTab === 0 && (
                  <ProductBasicTab
                    formData={formData}
                    errors={errors}
                    categories={categories}
                    availableBrands={availableBrands}
                    showAddBrandField={showAddBrandField}
                    newBrandName={newBrandName}
                    onChange={onChange}
                    onAddBrandClick={onAddBrandClick}
                    onCancelAddBrand={onCancelAddBrand}
                    onAddNewBrand={onAddNewBrand}
                    onNewBrandNameChange={onNewBrandNameChange}
                  />
                )}

                {activeTab === 1 && (
                  <ProductDescriptionTab
                    description={formData.description}
                    onChange={onChange}
                  />
                )}

                {activeTab === 2 && (
                  <ProductSpecsTab
                    attributes={formData.attributes}
                    onAddGroup={onAddGroup}
                    onRemoveGroup={onRemoveGroup}
                    onGroupNameChange={onGroupNameChange}
                    onAddItem={onAddItem}
                    onRemoveItem={onRemoveItem}
                    onItemChange={onItemChange}
                  />
                )}
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
