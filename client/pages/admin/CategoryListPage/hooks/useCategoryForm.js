import { useState } from "react";
import { toast } from "sonner";

const initialFormData = {
  name: "",
  description: "",
  icon: "CategoryIcon",
  image: "",
  color: "linear-gradient(135deg, #3A86FF, #214D8A)",
  defaultAttributes: [{ key: "", value: "" }],
};

const mapCategoryToFormData = (category) => ({
  name: category.name,
  description: category.description,
  icon: category.icon || "CategoryIcon",
  image: category.image || "",
  color: category.color || initialFormData.color,
  defaultAttributes:
    category.defaultAttributes && category.defaultAttributes.length > 0
      ? category.defaultAttributes.map((attr) => ({
          key: attr.key,
          value: attr.value || "",
        }))
      : [{ key: "", value: "" }],
});

export const useCategoryForm = ({ onCreate, onUpdate }) => {
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  const openCreateModal = () => {
    resetForm();
    setOpenModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setFormData(mapCategoryToFormData(category));
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: [...prev.defaultAttributes, { key: "", value: "" }],
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: prev.defaultAttributes.map((attr, attrIndex) =>
        attrIndex === index ? { ...attr, [field]: value } : attr,
      ),
    }));
  };

  const handleRemoveAttribute = (index) => {
    setFormData((prev) => {
      if (prev.defaultAttributes.length <= 1) return prev;

      return {
        ...prev,
        defaultAttributes: prev.defaultAttributes.filter((_, attrIndex) => attrIndex !== index),
      };
    });
  };

  const validate = () => {
    const hasEmptyAttributes = formData.defaultAttributes.some(
      (attr) => attr.key.trim() === "",
    );

    if (hasEmptyAttributes) {
      toast.error("Будь ласка, заповніть всі характеристики або видаліть порожні");
      return false;
    }

    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSaving(true);

      if (editingId) {
        await onUpdate(editingId, formData);
      } else {
        await onCreate(formData);
      }

      closeModal();
    } catch (saveError) {
      console.error("Error saving category:", saveError);
      toast.error("Помилка при збереженні категорії");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    openModal,
    editingId,
    formData,
    isSaving,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFieldChange,
    handleAddAttribute,
    handleAttributeChange,
    handleRemoveAttribute,
    handleSave,
  };
};
