import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Fade,
  Backdrop,
  Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast } from "sonner";
import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";

import ImageUploadField from "./ImageUploadField.jsx";
import BrandSelector from "./BrandSelector.jsx";
import AttributesManager from "./AttributesManager.jsx";

const ProductModal = ({
  open,
  onClose,
  editingId,
  formData,
  setFormData,
  categories,
  brands,
  products,
  onSave,
  onCreateBrand,
  isSaving,
}) => {
  const [availableBrands, setAvailableBrands] = useState(brands);
  const [showAddBrandField, setShowAddBrandField] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "",
    newBrand: "",
  });

  // Фільтруємо список брендів відповідно до обраної категорії
  useEffect(() => {
    if (formData.category && products) {
      // Знаходимо бренди товарів цієї категорії
      const categoryBrands = products
        .filter((product) => product.category === formData.category)
        .map((product) => product.brand);

      // Фільтруємо: бренди цієї категорії + поточний обраний
      const filteredBrands = brands.filter(
        (brand) =>
          categoryBrands.includes(brand.name) || brand.name === formData.brand,
      );

      setAvailableBrands(filteredBrands);
    } else {
      // Категорія не обрана — доступні всі бренди
      setAvailableBrands(brands);
    }
  }, [formData.category, formData.brand, brands, products]);

  // Очищаємо форму при закритті
  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      brand: "",
      price: "",
      stock: "",
      imageUrl: "",
      description: "",
      attributes: [],
    });
    setErrors({
      name: "",
      brand: "",
      price: "",
      stock: "",
      newBrand: "",
    });
    onClose();
  };

  // Створення нового бренду
  const handleAddNewBrand = async (newBrandName) => {
    if (!newBrandName || !newBrandName.trim()) {
      setErrors((prev) => ({ ...prev, newBrand: "Назва бренду обов'язкова" }));
      throw new Error("Empty brand name");
    }

    try {
      // Запит до API
      await onCreateBrand({ name: newBrandName.trim() });

      // Створено успішно: оновлюємо форму
      handleInputChange("brand", newBrandName.trim());
      setShowAddBrandField(false);
      setNewBrandName("");
      setErrors((prev) => ({ ...prev, newBrand: "" }));
      toast.success("Бренд успішно створено та збережено!");
    } catch (error) {
      console.error("Помилка при створенні бренду:", error);
      toast.error("Не вдалося створити бренд. Спробуйте ще раз.");
      throw error;
    }
  };

  const handleAddBrandClick = () => {
    setShowAddBrandField(true);
  };

  const handleCancelAddBrand = () => {
    setShowAddBrandField(false);
    setNewBrandName("");
    setErrors((prev) => ({ ...prev, newBrand: "" }));
  };

  // Оновлення полів форми
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Якщо категорія змінилася — заповнюємо характеристики за замовчуванням
      if (
        field === "category" &&
        (!prev.attributes || prev.attributes.length === 0)
      ) {
        const selectedCategory = categories.find((cat) => cat.name === value);
        if (
          selectedCategory &&
          selectedCategory.defaultAttributes &&
          selectedCategory.defaultAttributes.length > 0
        ) {
          newData.attributes = selectedCategory.defaultAttributes.map(
            (attr) => ({
              key: attr.key,
              value: attr.value,
            }),
          );
        }
      }
      return newData;
    });
  };

  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: "", value: "" }],
    }));
  };

  const handleUpdateAttribute = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const handleRemoveAttribute = (index) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  // Збереження форми з валідацією
  const handleSave = async (e) => {
    e.preventDefault();

    // Скидаємо попередні помилки
    const newErrors = {
      name: "",
      brand: "",
      price: "",
      stock: "",
      newBrand: "",
    };

    // Валідація
    let hasErrors = false;

    if (!formData.name.trim()) {
      newErrors.name = "Назва товару обов'язкова";
      hasErrors = true;
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Бренд обов'язковий";
      hasErrors = true;
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Ціна повинна бути більше 0";
      hasErrors = true;
    }

    if (formData.stock === "" || formData.stock < 0) {
      newErrors.stock = "Кількість не може бути від'ємною";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Помилка при збереженні товару");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 250,
          className: "admin-modal-backdrop",
        },
      }}
    >
      <Fade in={open} timeout={250}>
        <Box className="admin-modal-wrapper">
          <div className="admin-modal-card admin-solid-card">
            {/* Кнопка закрытия */}
            <button onClick={handleClose} className="admin-modal-close-btn">
              <CloseIcon />
            </button>

            {/* Заголовок */}
            <div className="admin-modal-header">
              <Typography variant="h5" component="h2">
                {editingId ? "Редагувати товар" : "Додати новий товар"}
              </Typography>
            </div>

            {/* Контент */}
            <div className="admin-modal-content">
              <Box
                id="product-form"
                component="form"
                onSubmit={handleSave}
                sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
              >
                <FormControl className="mui-form-control" fullWidth>
                  <TextField
                    autoFocus
                    label="Назва товару"
                    variant="outlined"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </FormControl>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl className="mui-form-control" sx={{ flex: 1 }}>
                    <InputLabel>Категорія</InputLabel>
                    <Select
                      label="Категорія"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      MenuProps={{ className: "mui-select-menu" }}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                          {cat.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ flex: 1 }}>
                    {showAddBrandField ? (
                      <div className="form-field-group">
                        <FormControl className="mui-form-control" fullWidth>
                          <TextField
                            label="Новий бренд"
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddNewBrand(newBrandName);
                              } else if (e.key === "Escape") {
                                handleCancelAddBrand();
                              }
                            }}
                            error={!!errors.newBrand}
                            helperText={errors.newBrand}
                            fullWidth
                            autoFocus
                          />
                        </FormControl>
                        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                          <Button
                            variant="contained"
                            onClick={() => handleAddNewBrand(newBrandName)}
                            disabled={!newBrandName.trim()}
                            size="small"
                            fullWidth
                          >
                            Додати
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleCancelAddBrand}
                            size="small"
                            fullWidth
                          >
                            Скасувати
                          </Button>
                        </Box>
                      </div>
                    ) : (
                      <BrandSelector
                        brands={availableBrands}
                        value={formData.brand}
                        onChange={(value) => handleInputChange("brand", value)}
                        onAddNewBrandClick={handleAddBrandClick}
                        error={errors.brand}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl className="mui-form-control" fullWidth>
                    <TextField
                      label="Ціна"
                      type="number"
                      variant="outlined"
                      value={formData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange(
                          "price",
                          val === "" ? "" : parseFloat(val) || "",
                        );
                      }}
                      InputProps={{
                        endAdornment: <Box sx={{ ml: 1 }}>₴</Box>,
                      }}
                      error={!!errors.price}
                      helperText={errors.price}
                      required
                    />
                  </FormControl>
                  <FormControl className="mui-form-control" fullWidth>
                    <TextField
                      label="Кількість (Stock)"
                      type="number"
                      variant="outlined"
                      value={formData.stock}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange(
                          "stock",
                          val === "" ? "" : parseInt(val) || "",
                        );
                      }}
                      error={!!errors.stock}
                      helperText={errors.stock}
                      required
                    />
                  </FormControl>
                </Box>

                <ImageUploadField
                  imageUrl={formData.imageUrl}
                  onImageChange={(value) =>
                    handleInputChange("imageUrl", value)
                  }
                />

                <AttributesManager
                  attributes={formData.attributes}
                  onAddAttribute={handleAddAttribute}
                  onUpdateAttribute={handleUpdateAttribute}
                  onRemoveAttribute={handleRemoveAttribute}
                />

                <FormControl className="mui-form-control" fullWidth>
                  <TextField
                    label="Опис товару"
                    variant="outlined"
                    multiline
                    minRows={4}
                    maxRows={10}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </FormControl>
              </Box>
            </div>

            {/* Кнопки */}
            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={handleClose}
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
                {isSaving ? "Збереження..." : "Зберегти"}
              </button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ProductModal;
