import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../../services/categoryService";

export const useAdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (loadError) {
      console.error("Error loading categories:", loadError);
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategoryItem = async (categoryData) => {
    await createCategory(categoryData);
    toast.success("Категорія створена!");
    await loadCategories();
  };

  const updateCategoryItem = async (id, categoryData) => {
    await updateCategory(id, categoryData);
    toast.success("Категорія оновлена!");
    await loadCategories();
  };

  const deleteCategoryItem = async (id) => {
    await deleteCategory(id);
    toast.success("Категорія успішно видалена!");
    await loadCategories();
  };

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategoryItem,
    updateCategoryItem,
    deleteCategoryItem,
  };
};
