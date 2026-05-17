import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal.jsx';
import { WarningAmber } from '@mui/icons-material';


import ProductStats from '../../../components/admin/products/ProductStats.jsx';
import ProductFilters from '../../../components/admin/products/ProductFilters.jsx';
import ProductTable from '../../../components/admin/products/ProductTable.jsx';
import ProductModal from '../../../components/admin/products/ProductModal.jsx';

import { useProducts } from '../../../hooks/useProducts.js';
import { useProductSort } from '../../../hooks/useProductSort.js';
import { useProductFilter } from '../../../hooks/useProductFilter.js';

import '../../../styles/_common.scss';
import '../../../styles/_mui-theme.scss';
import '../../../styles/_admin.scss';
import './ProductListPage.scss';



//Головна сторінка управління товарами
const ProductListPage = () => {
  // Основні хуки: дані, сортування, фільтрація
  const { products, categories, brands, isLoading, createProduct, updateProduct, deleteProduct, createBrand } = useProducts();
  const { sortConfig, handleSort, sortProducts } = useProductSort();
  const { searchTerm, category, setSearchTerm, setCategory, filterProducts } = useProductFilter(products);

  // Стан для модальних вікон
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    stock: '',
    imageUrl: '',
    description: '',
    attributes: []
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Кількість товарів на сторінці
  const perPage = 20;

  // Обробка подій
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      brand: '',
      price: '',
      stock: '',
      imageUrl: '',
      description: '',
      attributes: []
    });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock || 0,
      imageUrl: product.image || product.imageUrl || '',
      description: product.description || '',
      attributes: product.attributes || []
    });
    setOpenModal(true);
  };

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

  const handleSaveProduct = async (productData) => {
    try {
      setIsSaving(true);
      if (editingId) {
        await updateProduct(editingId, productData);
        toast.success('Товар успішно оновлено!');
      } else {
        await createProduct(productData);
        toast.success('Товар успішно створено!');
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error('Помилка при збереженні товару');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Обчислюємо відфільтровані та відсортовані продукти
  const filteredProducts = filterProducts(sortProducts(products));
  const totalPages = Math.ceil(filteredProducts.length / perPage);

  // Скидання сторінки при зміні фільтрів
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [searchTerm, category]);

  return (
    <Box>
      {/* --- ЗАГОЛОВОК СТОРІНКИ --- */}
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
          className="btn-primary btn-with-icon"
          onClick={handleOpenModal}
        >
          <AddIcon />
          Додати товар
        </button>
      </Box>

      {/* Використовуємо компонент міні-статистики */}
      <ProductStats
        products={filteredProducts}
        searchTerm={searchTerm}
      />

      {/* Використовуємо компонент фільтрів */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
      />

      {/* Використовуємо компонент таблиці */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        sortConfig={sortConfig}
        page={page}
        perPage={perPage}
        totalPages={totalPages}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onPageChange={setPage}
      />

      {/* Використовуємо компонент модалки */}
      <ProductModal
        open={openModal}
        onClose={handleCloseModal}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        brands={brands}
        products={products}
        onSave={handleSaveProduct}
        onCreateBrand={createBrand}
        isSaving={isSaving}
      />

      {/* --- МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ --- */}
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
