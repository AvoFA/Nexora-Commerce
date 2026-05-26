import { useState } from "react";
import { toast } from "sonner";

const initialFormData = {
  name: "",
  description: "",
  icon: "CategoryIcon",
  image: "",
  color: "linear-gradient(135deg, #3A86FF, #214D8A)",
  defaultAttributes: [{ groupName: "", items: [{ key: "", value: "" }] }],
};

const mapCategoryToFormData = (category) => ({
  name: category.name,
  description: category.description,
  icon: category.icon || "CategoryIcon",
  image: category.image || "",
  color: category.color || initialFormData.color,
  defaultAttributes:
    category.defaultAttributes && category.defaultAttributes.length > 0
      ? category.defaultAttributes.map((group) => ({
          groupName: group.groupName || "",
          items:
            group.items && group.items.length > 0
              ? group.items.map((item) => ({
                  key: item.key || "",
                  value: item.value || "",
                }))
              : [{ key: "", value: "" }],
        }))
      : [{ groupName: "", items: [{ key: "", value: "" }] }],
});

const slugify = (text) => {
  const cyrillicToLatinMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
    'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ь': '', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z',
    'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
  };

  const slug = text
    .split('')
    .map((char) => cyrillicToLatinMap[char] || char)
    .join('');

  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
};

export const useCategoryForm = ({ onCreate, onUpdate }) => {
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSlugLocked, setIsSlugLocked] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsSlugLocked(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsSlugLocked(false);
    setOpenModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setFormData(mapCategoryToFormData(category));
    setIsSlugLocked(true);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "description" && !isSlugLocked) {
        updated.name = slugify(value);
      }
      return updated;
    });
  };

  const handleAddGroup = () => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: [
        ...prev.defaultAttributes,
        { groupName: "", items: [{ key: "", value: "" }] },
      ],
    }));
  };

  const handleRemoveGroup = (groupIndex) => {
    setFormData((prev) => {
      if (prev.defaultAttributes.length <= 1) return prev;
      return {
        ...prev,
        defaultAttributes: prev.defaultAttributes.filter((_, idx) => idx !== groupIndex),
      };
    });
  };

  const handleGroupNameChange = (groupIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: prev.defaultAttributes.map((group, idx) =>
        idx === groupIndex ? { ...group, groupName: value } : group,
      ),
    }));
  };

  const handleAddItem = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: prev.defaultAttributes.map((group, idx) =>
        idx === groupIndex
          ? { ...group, items: [...group.items, { key: "", value: "" }] }
          : group,
      ),
    }));
  };

  const handleRemoveItem = (groupIndex, itemIndex) => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: prev.defaultAttributes.map((group, idx) => {
        if (idx !== groupIndex) return group;
        if (group.items.length <= 1) return group;
        return {
          ...group,
          items: group.items.filter((_, itemIdx) => itemIdx !== itemIndex),
        };
      }),
    }));
  };

  const handleItemChange = (groupIndex, itemIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: prev.defaultAttributes.map((group, idx) =>
        idx === groupIndex
          ? {
              ...group,
              items: group.items.map((item, itemIdx) =>
                itemIdx === itemIndex ? { ...item, [field]: value } : item,
              ),
            }
          : group,
      ),
    }));
  };

  const validate = () => {
    const hasEmptyGroup = formData.defaultAttributes.some(
      (group) => group.groupName.trim() === "",
    );

    if (hasEmptyGroup) {
      toast.error("Будь ласка, заповніть назви всіх груп характеристик");
      return false;
    }

    const hasEmptyKey = formData.defaultAttributes.some((group) =>
      group.items.some((item) => item.key.trim() === ""),
    );

    if (hasEmptyKey) {
      toast.error("Будь ласка, заповніть назви всіх характеристик");
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
    isSlugLocked,
    setIsSlugLocked,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFieldChange,
    handleAddGroup,
    handleRemoveGroup,
    handleGroupNameChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleSave,
  };
};
