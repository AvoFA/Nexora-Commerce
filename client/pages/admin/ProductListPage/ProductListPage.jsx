import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Add as AddIcon, WarningAmber } from '@mui/icons-material';
import { toast } from 'sonner';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal.jsx';
import ProductFormModal from './components/ProductFormModal.jsx';
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
  const [lowStockFilterActive, setLowStockFilterActive] = useState(false);

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
    setLowStockFilterActive((prev) => !prev);
  };

  // Apply low-stock filter on top of the normal table state if active
  const displayedProducts = lowStockFilterActive
    ? tableState.currentProducts.filter((p) => Number(p.stock || 0) <= 5)
    : tableState.currentProducts;

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
        <button
          type="button"
          className="btn-primary btn-with-icon"
          onClick={productForm.openCreateModal}
        >
          <AddIcon />
          Додати товар
        </button>
      </Box>

      <ProductStats
        products={products}
        lowStockFilterActive={lowStockFilterActive}
        onToggleLowStockFilter={handleToggleLowStockFilter}
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
        onAddAttribute={productForm.handleAddAttribute}
        onUpdateAttribute={productForm.handleUpdateAttribute}
        onRemoveAttribute={productForm.handleRemoveAttribute}
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
    </Box>
  );
};

export default ProductListPage;
