import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const emptyFormData = {
  name: '',
  category: '',
  brand: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  imageUrl: '',
  description: '',
  attributes: [],
};

const emptyErrors = {
  name: '',
  brand: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  newBrand: '',
};

export const useProductForm = ({
  categories = [],
  brands = [],
  products = [],
  createProduct,
  updateProduct,
  createBrand,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [errors, setErrors] = useState(emptyErrors);
  const [showAddBrandField, setShowAddBrandField] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const availableBrands = useMemo(() => {
    if (!formData.category || !products) return brands;

    const categoryBrands = products
      .filter((product) => product.category === formData.category)
      .map((product) => product.brand);

    return brands.filter(
      (brand) => categoryBrands.includes(brand.name) || brand.name === formData.brand,
    );
  }, [formData.category, formData.brand, brands, products]);

  const resetForm = () => {
    setFormData(emptyFormData);
    setErrors(emptyErrors);
    setShowAddBrandField(false);
    setNewBrandName('');
  };

  const openCreateModal = () => {
    setEditingId(null);
    resetForm();
    setOpenModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      stock: product.stock || 0,
      imageUrl: product.image || product.imageUrl || '',
      description: product.description || '',
      attributes:
        product.attributes && product.attributes.length > 0
          ? product.attributes.map((group) => ({
              groupName: group.groupName || '',
              items:
                group.items && group.items.length > 0
                  ? group.items.map((item) => ({
                      key: item.key || '',
                      value: item.value || '',
                    }))
                  : [{ key: '', value: '' }],
            }))
          : [],
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingId(null);
    resetForm();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [field]: value };

      if (field === 'category' && (!prev.attributes || prev.attributes.length === 0)) {
        const selectedCategory = categories.find((cat) => cat.name === value);

        if (selectedCategory?.defaultAttributes?.length > 0) {
          nextData.attributes = selectedCategory.defaultAttributes.map((group) => ({
            groupName: group.groupName || '',
            items:
              group.items && group.items.length > 0
                ? group.items.map((item) => ({
                    key: item.key || '',
                    value: item.value || '',
                  }))
                : [{ key: '', value: '' }],
          }));
        }
      }

      return nextData;
    });
  };

  const handleAddGroup = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { groupName: '', items: [{ key: '', value: '' }] }],
    }));
  };

  const handleRemoveGroup = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, idx) => idx !== groupIndex),
    }));
  };

  const handleGroupNameChange = (groupIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((group, idx) =>
        idx === groupIndex ? { ...group, groupName: value } : group,
      ),
    }));
  };

  const handleAddItem = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((group, idx) =>
        idx === groupIndex
          ? { ...group, items: [...group.items, { key: '', value: '' }] }
          : group,
      ),
    }));
  };

  const handleRemoveItem = (groupIndex, itemIndex) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((group, idx) => {
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
      attributes: prev.attributes.map((group, idx) =>
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

  const handleAddBrandClick = () => {
    setShowAddBrandField(true);
  };

  const handleCancelAddBrand = () => {
    setShowAddBrandField(false);
    setNewBrandName('');
    setErrors((prev) => ({ ...prev, newBrand: '' }));
  };

  const handleAddNewBrand = async (brandName) => {
    if (!brandName || !brandName.trim()) {
      setErrors((prev) => ({ ...prev, newBrand: "Назва бренду обов'язкова" }));
      throw new Error('Empty brand name');
    }

    try {
      await createBrand({ name: brandName.trim() });
      handleInputChange('brand', brandName.trim());
      setShowAddBrandField(false);
      setNewBrandName('');
      setErrors((prev) => ({ ...prev, newBrand: '' }));
      toast.success('Бренд успішно створено та збережено!');
    } catch (error) {
      console.error('Помилка при створенні бренду:', error);
      toast.error('Не вдалося створити бренд. Спробуйте ще раз.');
      throw error;
    }
  };

  const validateForm = () => {
    const nextErrors = { ...emptyErrors };
    let hasErrors = false;

    if (!formData.name.trim()) {
      nextErrors.name = "Назва товару обов'язкова";
      hasErrors = true;
    }

    if (!formData.brand.trim()) {
      nextErrors.brand = "Бренд обов'язковий";
      hasErrors = true;
    }

    if (!formData.price || formData.price <= 0) {
      nextErrors.price = 'Ціна повинна бути більше 0';
      hasErrors = true;
    }

    if (
      formData.compareAtPrice !== '' &&
      Number(formData.compareAtPrice) <= Number(formData.price || 0)
    ) {
      nextErrors.compareAtPrice = 'Стара ціна має бути більшою за поточну ціну';
      hasErrors = true;
    }

    if (formData.stock === '' || formData.stock < 0) {
      nextErrors.stock = "Кількість не може бути від'ємною";
      hasErrors = true;
    }

    // Validate attributes grouping
    const hasEmptyGroup = formData.attributes.some((group) => !group.groupName || group.groupName.trim() === '');
    if (hasEmptyGroup) {
      toast.error('Будь ласка, вкажіть назву для всіх груп характеристик');
      hasErrors = true;
    }

    const hasEmptyKey = formData.attributes.some((group) =>
      group.items.some((item) => !item.key || item.key.trim() === ''),
    );
    if (hasEmptyKey) {
      toast.error('Будь ласка, вкажіть назву для всіх характеристик');
      hasErrors = true;
    }

    setErrors(nextErrors);
    return !hasErrors;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      if (editingId) {
        await updateProduct(editingId, formData);
        toast.success('Товар успішно оновлено!');
      } else {
        await createProduct(formData);
        toast.success('Товар успішно створено!');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Помилка при збереженні товару');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!openModal) resetForm();
  }, [openModal]);

  return {
    openModal,
    editingId,
    formData,
    errors,
    availableBrands,
    showAddBrandField,
    newBrandName,
    isSaving,
    openCreateModal,
    openEditModal,
    closeModal,
    handleInputChange,
    handleAddGroup,
    handleRemoveGroup,
    handleGroupNameChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleAddBrandClick,
    handleCancelAddBrand,
    handleAddNewBrand,
    handleSaveProduct,
    setNewBrandName,
  };
};
