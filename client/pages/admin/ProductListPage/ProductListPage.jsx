import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Add as AddIcon, DataObject as JsonIcon, WarningAmber } from '@mui/icons-material';
import { toast } from 'sonner';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal.jsx';
import ProductFormModal from './components/ProductFormModal.jsx';
import ProductImportModal from './components/ProductImportModal.jsx';
import ProductStats from './components/ProductStats.jsx';
import ProductTable from './components/ProductTable.jsx';
import ProductToolbar from './components/ProductToolbar.jsx';
import { useAdminProducts } from './hooks/useAdminProducts.js';
import { useProductForm } from './hooks/useProductForm.js';
import { useProductTableState } from './hooks/useProductTableState.js';

import '../../../styles/_common.scss';
import '../../../styles/_mui-theme.scss';
import '../../../styles/_admin.scss';
import './ProductListPage.scss';

const ProductListPage = () => {
  const {
    products,
    categories,
    brands,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    createBrand,
    refresh,
  } = useAdminProducts();

  const productForm = useProductForm({
    categories,
    brands,
    products,
    createProduct,
    updateProduct,
    createBrand,
  });

  const tableState = useProductTableState(products);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lowStockFilterActive = searchParams.get('lowStock') === 'true';
  const outOfStockFilterActive = searchParams.get('outOfStock') === 'true';

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id);
      toast.success('Товар успішно видалено!');
    } catch (error) {
      toast.error('Помилка при видаленні товару');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleUpdateStock = async (productId, newStock) => {
    if (newStock < 0) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    try {
      await updateProduct(productId, { ...product, stock: newStock });
      toast.success(`Залишок товару "${product.name}" оновлено до ${newStock}`);
    } catch (error) {
      toast.error('Помилка при оновленні залишку товару');
    }
  };

  const handleToggleLowStockFilter = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (next.get('lowStock') === 'true') {
          next.delete('lowStock');
        } else {
          next.set('lowStock', 'true');
          next.delete('outOfStock');
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleToggleOutOfStockFilter = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (next.get('outOfStock') === 'true') {
          next.delete('outOfStock');
        } else {
          next.set('outOfStock', 'true');
          next.delete('lowStock');
        }
        return next;
      },
      { replace: true }
    );
  };

  // Apply low-stock filter on top of the normal table state if active
  const displayedProducts = tableState.currentProducts;

  return (
    <Box>
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Керування товарами
          </Typography>
          <Typography variant="body2" className="subtitle">
            Керуйте вашим асортиментом
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary btn-with-icon"
            onClick={() => setShowImportModal(true)}
          >
            <JsonIcon />
            Імпорт
          </button>
          <button
            type="button"
            className="btn-primary btn-with-icon"
            onClick={productForm.openCreateModal}
          >
            <AddIcon />
            Додати товар
          </button>
        </div>
      </Box>

      <ProductStats
        products={products}
        lowStockFilterActive={lowStockFilterActive}
        onToggleLowStockFilter={handleToggleLowStockFilter}
        outOfStockFilterActive={outOfStockFilterActive}
        onToggleOutOfStockFilter={handleToggleOutOfStockFilter}
        onEditProduct={productForm.openEditModal}
      />

      <ProductToolbar
        searchTerm={tableState.searchTerm}
        onSearchChange={tableState.setSearchTerm}
        onSearchClear={() => tableState.setSearchTerm('')}
        category={tableState.category}
        onCategoryChange={tableState.setCategory}
        categories={categories}
        brand={tableState.brand}
        onBrandChange={tableState.setBrand}
        brands={brands}
        sortValue={tableState.sortValue}
        onSortChange={tableState.setSortValue}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <ProductTable
        products={displayedProducts}
        searchTerm={tableState.searchTerm}
        isLoading={isLoading}
        sortConfig={tableState.sortConfig}
        page={tableState.page}
        perPage={tableState.perPage}
        totalPages={tableState.totalPages}
        totalProducts={tableState.totalProducts}
        startIndex={tableState.startIndex}
        onSort={tableState.handleSort}
        onEdit={productForm.openEditModal}
        onDelete={handleDeleteClick}
        onPageChange={tableState.setPage}
        onPerPageChange={tableState.setPerPage}
        onUpdateStock={handleUpdateStock}
      />

      <ProductFormModal
        open={productForm.openModal}
        onClose={productForm.closeModal}
        editingId={productForm.editingId}
        formData={productForm.formData}
        errors={productForm.errors}
        categories={categories}
        availableBrands={productForm.availableBrands}
        showAddBrandField={productForm.showAddBrandField}
        newBrandName={productForm.newBrandName}
        isSaving={productForm.isSaving}
        onChange={productForm.handleInputChange}
        onSave={productForm.handleSaveProduct}
        onAddGroup={productForm.handleAddGroup}
        onRemoveGroup={productForm.handleRemoveGroup}
        onGroupNameChange={productForm.handleGroupNameChange}
        onAddItem={productForm.handleAddItem}
        onRemoveItem={productForm.handleRemoveItem}
        onItemChange={productForm.handleItemChange}
        onAddBrandClick={productForm.handleAddBrandClick}
        onCancelAddBrand={productForm.handleCancelAddBrand}
        onAddNewBrand={productForm.handleAddNewBrand}
        onNewBrandNameChange={productForm.setNewBrandName}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        type="danger"
        className="delete-modal"
        icon={WarningAmber}
        title="Видалити товар?"
        message={
          productToDelete?.name
            ? <><strong>{productToDelete.name}</strong> буде видалено назавжди.</>
            : 'Товар буде видалено назавжди.'
        }
        confirmText="Видалити"
        cancelText="Скасувати"
      />
      <ProductImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={refresh}
      />
    </Box>
  );
};

export default ProductListPage;
