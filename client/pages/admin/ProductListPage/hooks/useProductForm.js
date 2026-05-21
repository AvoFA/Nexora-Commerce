import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const emptyFormData = {
  name: '',
  category: '',
  brand: '',
  price: '',
  stock: '',
  imageUrl: '',
  description: '',
  attributes: [],
};

const emptyErrors = {
  name: '',
  brand: '',
  price: '',
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
      stock: product.stock || 0,
      imageUrl: product.image || product.imageUrl || '',
      description: product.description || '',
      attributes: product.attributes || [],
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
          nextData.attributes = selectedCategory.defaultAttributes.map((attr) => ({
            key: attr.key,
            value: attr.value,
          }));
        }
      }

      return nextData;
    });
  };

  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }],
    }));
  };

  const handleUpdateAttribute = (index, field, value) => {
    const nextAttributes = [...formData.attributes];
    nextAttributes[index][field] = value;
    setFormData((prev) => ({ ...prev, attributes: nextAttributes }));
  };

  const handleRemoveAttribute = (index) => {
    const nextAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, attributes: nextAttributes }));
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

    if (formData.stock === '' || formData.stock < 0) {
      nextErrors.stock = "Кількість не може бути від'ємною";
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
    handleAddAttribute,
    handleUpdateAttribute,
    handleRemoveAttribute,
    handleAddBrandClick,
    handleCancelAddBrand,
    handleAddNewBrand,
    handleSaveProduct,
    setNewBrandName,
  };
};
