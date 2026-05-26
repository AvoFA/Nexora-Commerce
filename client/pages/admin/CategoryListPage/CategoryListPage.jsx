import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Add as AddIcon, WarningAmber } from "@mui/icons-material";
import { toast } from "sonner";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal.jsx";
import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./CategoryListPage.scss";

import CategoryFormModal from "./components/CategoryFormModal.jsx";
import CategoryList from "./components/CategoryList.jsx";
import CategoryStats from "./components/CategoryStats.jsx";
import CategoryToolbar from "./components/CategoryToolbar.jsx";
import { useAdminCategories } from "./hooks/useAdminCategories.js";
import { useCategoryForm } from "./hooks/useCategoryForm.js";

const CategoryListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const {
    categories,
    loading,
    loadCategories,
    createCategoryItem,
    updateCategoryItem,
    deleteCategoryItem,
  } = useAdminCategories();

  const categoryForm = useCategoryForm({
    onCreate: createCategoryItem,
    onUpdate: updateCategoryItem,
  });

  const totalProducts = useMemo(
    () => categories.reduce((sum, category) => sum + (category.count || 0), 0),
    [categories],
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [categories, searchTerm],
  );

  const handleDeleteRequest = (category) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete?.id) return;

    try {
      await deleteCategoryItem(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Помилка при видаленні категорії");
    }
  };

  return (
    <Box className="admin-categories-page">
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Керування категоріями
          </Typography>
          <Typography variant="body2" className="subtitle">
            Налаштування категорій товарів та їх характеристик
          </Typography>
        </div>
        <button
          type="button"
          className="btn-primary btn-with-icon"
          onClick={categoryForm.openCreateModal}
        >
          <AddIcon />
          Додати категорію
        </button>
      </Box>

      <CategoryStats categories={categories} totalProducts={totalProducts} />

      <CategoryToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchClear={() => setSearchTerm("")}
        onRefresh={loadCategories}
        isLoading={loading}
      />

      <CategoryFormModal
        open={categoryForm.openModal}
        editingId={categoryForm.editingId}
        formData={categoryForm.formData}
        isSaving={categoryForm.isSaving}
        isSlugLocked={categoryForm.isSlugLocked}
        onToggleSlugLock={() => categoryForm.setIsSlugLocked(!categoryForm.isSlugLocked)}
        onClose={categoryForm.closeModal}
        onSave={categoryForm.handleSave}
        onFieldChange={categoryForm.handleFieldChange}
        onAddGroup={categoryForm.handleAddGroup}
        onRemoveGroup={categoryForm.handleRemoveGroup}
        onGroupNameChange={categoryForm.handleGroupNameChange}
        onAddItem={categoryForm.handleAddItem}
        onRemoveItem={categoryForm.handleRemoveItem}
        onItemChange={categoryForm.handleItemChange}
      />

      <CategoryList
        categories={categories}
        filteredCategories={filteredCategories}
        searchTerm={searchTerm}
        loading={loading}
        onEdit={categoryForm.openEditModal}
        onDelete={handleDeleteRequest}
      />



      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        type="danger"
        className="delete-modal"
        icon={WarningAmber}
        title="Видалити категорію?"
        message={
          categoryToDelete?.description || categoryToDelete?.name
            ? (
                <>
                  <strong>{categoryToDelete.description || categoryToDelete.name}</strong>{" "}
                  буде видалено назавжди.
                </>
              )
            : "Категорію буде видалено назавжди."
        }
        confirmText="Видалити"
        cancelText="Скасувати"
      />
    </Box>
  );
};

export default CategoryListPage;
