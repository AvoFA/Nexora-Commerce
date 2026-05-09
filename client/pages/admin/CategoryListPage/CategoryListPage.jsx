import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Modal,
  Fade,
  FormControl,
  TextField,
  Button,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Smartphone,
  Laptop,
  Tablet,
  ExpandMore as ExpandMoreIcon,
  Edit,
  Delete,
  Category as CategoryIcon,
  Close as CloseIcon,
  DeleteOutline,
  Search,
} from "@mui/icons-material";
import { toast } from 'sonner';
import {
  getCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from "../../../services/categoryService";
import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./CategoryListPage.scss";

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "CategoryIcon",
    image: "",
    color: "linear-gradient(135deg, #3A86FF, #214D8A)",
    defaultAttributes: [{ key: "", value: "" }],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon || "CategoryIcon",
      image: category.image || "",
      color: category.color || "linear-gradient(135deg, #3A86FF, #214D8A)",
      defaultAttributes:
        category.defaultAttributes && category.defaultAttributes.length > 0
          ? category.defaultAttributes.map((attr) => ({
              key: attr.key,
              value: attr.value || "",
            }))
          : [{ key: "", value: "" }],
    });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю категорію?")) {
      try {
        await deleteCategory(id);
        toast.success('Категорія успішно видалена!');
        loadCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error('Помилка при видаленні категорії');
      }
    }
  };

  // Функції для роботи з атрибутами
  const handleAddAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: [...prev.defaultAttributes, { key: "", value: "" }],
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.defaultAttributes];
    newAttributes[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      defaultAttributes: newAttributes,
    }));
  };

  const handleRemoveAttribute = (index) => {
    if (formData.defaultAttributes.length > 1) {
      setFormData((prev) => ({
        ...prev,
        defaultAttributes: prev.defaultAttributes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Валідація: перевіряємо чи всі характеристики заповнені
    const hasEmptyAttributes = formData.defaultAttributes.some(
      attr => attr.key.trim() === ''
    );

    if (hasEmptyAttributes) {
      toast.error('Будь ласка, заповніть всі характеристики або видаліть порожні');
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success('Категорія оновлена!');
      } else {
        await createCategory(formData);
        toast.success('Категорія створена!');
      }
      setOpenModal(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        icon: "CategoryIcon",
        image: "",
        color: "linear-gradient(135deg, #3A86FF, #214D8A)",
        defaultAttributes: [{ key: "", value: "" }],
      });
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error('Помилка при збереженні категорії');
    }
  };

  // Helper to get icon component based on string name
  const getIcon = (iconName) => {
    switch (iconName) {
      case "Smartphone":
        return <Smartphone />;
      case "Laptop":
        return <Laptop />;
      case "Tablet":
        return <Tablet />;
      default:
        return <CategoryIcon />;
    }
  };

  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat.count || 0),
    0
  );

  // Фільтруємо категорії за пошуковим терміном
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      {/* Заголовок сторінки*/}
      <div className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Категорії
          </Typography>
          <Typography variant="body2" className="subtitle">
            Керування категоріями товарів
          </Typography>
        </div>
        <button
          className="btn-primary btn-with-icon"
          onClick={() => setOpenModal(true)}
        >
          <AddIcon sx={{ width: "20px", height: "20px" }} />
          Додати категорію
        </button>
      </div>

      {/* Статистичні картки */}
      <div
        className="products-stats-mini category-stats-overview"
        style={{ marginBottom: "16px" }}
      >
        <div className="stat-mini-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: "linear-gradient(135deg, #3A86FF, #214D8A)" }}
          >
            <CategoryIcon sx={{ fontSize: 32 }} />
          </div>
          <div className="stat-content">
            <p className="stat-value">{categories.length}</p>
            <p className="stat-label">Загальна кількість категорій</p>
          </div>
        </div>

        <div className="stat-mini-card">
          <div
            className="stat-icon-wrapper"
            style={{ background: "linear-gradient(135deg, #8338EC, #5A189A)" }}
          >
            <Smartphone sx={{ fontSize: 32 }} />
          </div>
          <div className="stat-content">
            <p className="stat-value">{totalProducts}</p>
            <p className="stat-label">Загальна кількість товарів</p>
          </div>
        </div>
      </div>

      {/*Пошук категорій*/}
      <div
        className="admin-solid-card filter-card"
        style={{ marginBottom: "24px" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <FormControl className="mui-form-control" sx={{ flexGrow: 1 }}>
            <TextField
              placeholder="Пошук категорій за назвою..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                    <Search sx={{ color: "text.secondary" }} />
                  </Box>
                ),
              }}
            />
          </FormControl>
        </Box>
      </div>

      {/*МОДАЛКА ДОДАВАННЯ*/}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: { timeout: 250, className: "admin-modal-backdrop" },
        }}
      >
        <Fade in={openModal} timeout={250}>
          <Box className="admin-modal-wrapper">
            <div className="admin-modal-card admin-solid-card">
              <button
                onClick={() => setOpenModal(false)}
                className="admin-modal-close-btn"
              >
                <CloseIcon />
              </button>
              <div className="admin-modal-header">
                <Typography variant="h5">
                  {editingId ? "Редагувати категорію" : "Додати категорію"}
                </Typography>
              </div>
              <div className="admin-modal-content">
                <form
                  id="cat-form"
                  onSubmit={handleSave}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <FormControl className="mui-form-control" fullWidth>
                    <TextField
                      label="Назва категорії"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      helperText="напр. Смартфони"
                      required
                    />
                  </FormControl>

                  <FormControl className="mui-form-control" fullWidth>
                    <TextField
                      label="ID (Англійською)"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      helperText="Унікальний ідентифікатор (напр. phones)"
                      required
                    />
                  </FormControl>

                  {/* Секція характеристик */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">
                        Характеристики категорії
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddAttribute}
                      >
                        Додати
                      </Button>
                    </Box>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      {formData.defaultAttributes.map((attr, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <FormControl
                            className="mui-form-control"
                            sx={{ flex: 1 }}
                          >
                            <TextField
                              size="small"
                              label="Назва характеристики"
                              value={attr.key}
                              onChange={(e) =>
                                handleAttributeChange(
                                  index,
                                  "key",
                                  e.target.value
                                )
                              }
                              placeholder="напр. Діагональ, Пам'ять"
                            />
                          </FormControl>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveAttribute(index)}
                            disabled={formData.defaultAttributes.length <= 1}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </form>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="btn-secondary"
                >
                  Скасувати
                </button>
                <button type="submit" form="cat-form" className="btn-primary">
                  Зберегти
                </button>
              </div>
            </div>
          </Box>
        </Fade>
      </Modal>

      {/* Мобильная версия - карточки */}
      <div className="mobile-only-view">
        {loading ? (
          <Typography sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            Завантаження...
          </Typography>
        ) : filteredCategories.length === 0 ? (
          <Typography sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            {searchTerm ? `Категорії з назвою "${searchTerm}" не знайдено` : "Немає даних для відображення"}
          </Typography>
        ) : (
          <div className="admin-mobile-categories">
            {filteredCategories.map((category) => (
              <div key={category.id} className="admin-category-card">
                <div className="category-card-header">
                  <div className="category-icon">
                    {React.cloneElement(getIcon(category.icon), {
                      sx: { width: 60, height: 60, color: "#3A86FF" },
                      style: { backgroundColor: "#E3F2FD", borderRadius: "50%", padding: "12px" }
                    })}
                  </div>
                  <div className="category-info">
                    <h4 className="mobile-category-name">{category.name}</h4>
                    <p className="mobile-category-description">{category.description || "Немає опису"}</p>
                  </div>
                </div>

                <div className="category-card-stats">
                  <div className="category-products-count">
                    {category.count || 0} товарів
                  </div>
                  {category.defaultAttributes &&
                    category.defaultAttributes.filter(
                      (attr) => attr.key && attr.key.trim() !== ""
                    ).length > 0 && (
                    <div className="category-attributes-count">
                      {category.defaultAttributes.filter(
                        (attr) => attr.key && attr.key.trim() !== ""
                      ).length} характеристик
                    </div>
                  )}
                </div>

                <div className="category-card-actions">
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(category.id)}
                    fullWidth
                    style={{ marginBottom: '8px' }}
                  >
                    Видалити
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(category)}
                    fullWidth
                  >
                    Редагувати
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Десктоп версия - accordion */}
      <div className="desktop-only-view">
        {loading ? (
          <Typography sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            Завантаження...
          </Typography>
        ) : categories.length === 0 ? (
          <Typography sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            Немає даних для відображення
          </Typography>
        ) : filteredCategories.length === 0 ? (
          <Typography sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            Категорії з назвою "{searchTerm}" не знайдено
          </Typography>
        ) : (
          filteredCategories.map((category) => (
            <Accordion
              key={category.id}
              sx={{
                background:
                  "linear-gradient(135deg, rgba(58,86,255,0.1), rgba(33,77,138,0.1))",
                border: "1px solid rgba(58,86,255,0.2)",
                borderRadius: 2,
                mb: 1,
                "&:before": { display: "none" },
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#3A86FF" }} />}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(58,86,255,0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                    pr: 2,
                  }}
                >
                  {React.cloneElement(getIcon(category.icon), {
                    sx: {
                      width: 28,
                      height: 28,
                      color: "#3A86FF",
                      backgroundColor: "#E3F2FD",
                      borderRadius: "50%",
                      padding: "4px",
                    },
                  })}

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description || "Немає опису"}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${category.count || 0} товарів`}
                    size="small"
                    sx={{
                      backgroundColor: (theme) => theme.palette.primary.main,
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails
                sx={{ backgroundColor: "rgba(0,0,0,0.01)", p: 2 }}
              >
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    startIcon={<Delete />}
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(category.id)}
                  >
                    Видалити
                  </Button>
                  <Button
                    startIcon={<Edit />}
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEdit(category)}
                  >
                    Редагувати
                  </Button>
                </Box>

                {category.defaultAttributes &&
                  category.defaultAttributes.filter(
                    (attr) => attr.key && attr.key.trim() !== ""
                  ).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Характеристики (
                        {
                          category.defaultAttributes.filter(
                            (attr) => attr.key && attr.key.trim() !== ""
                          ).length
                        }
                        )
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {category.defaultAttributes.slice(0, 5).map(
                          (attr, idx) =>
                            attr.key &&
                            attr.key.trim() !== "" && (
                              <Chip
                                key={idx}
                                size="small"
                                label={attr.key}
                                variant="outlined"
                                color="primary"
                                sx={{
                                  fontSize: "0.75rem",
                                  height: 24,
                                  "& .MuiChip-label": {
                                    padding: "2px 8px",
                                  },
                                }}
                              />
                            )
                        )}
                        {category.defaultAttributes.filter(
                          (attr) => attr.key && attr.key.trim() !== ""
                        ).length > 5 && (
                          <Chip
                            size="small"
                            label={`+${
                              category.defaultAttributes.filter(
                                (attr) => attr.key && attr.key.trim() !== ""
                              ).length - 5
                            }`}
                            variant="outlined"
                            color="default"
                            sx={{ opacity: 0.7 }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </div>

      {/* Category Overview*/}
      <Box className="admin-solid-card category-overview-card ">
        <h3 className="category-overview-title">Огляд категорій</h3>
        <div className="overview-list">
          {categories.map((category) => {
            const count = category.count || 0;
            const percentage =
              totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
            return (
              <div key={category.id} className="admin-category-stat-row">
                <div className="category-stat-details">
                  <div
                    className="stat-icon-wrapper"
                    style={{ background: category.color }}
                  >
                    {React.cloneElement(getIcon(category.icon), {
                      sx: { width: 24, height: 24 },
                    })}
                  </div>
                  <span className="stat-name">{category.name}</span>
                </div>
                <div className="category-stat-progress">
                  <div className="stat-count-info">
                    <p className="stat-count-value">{count} товарів</p>
                    <p className="stat-count-percent">
                      {percentage}% від загальної
                    </p>
                  </div>
                  <div className="stat-progress-bar-container">
                    <div
                      className="stat-progress-bar"
                      style={{
                        width: `${percentage}%`,
                        background:
                          percentage > 0 ? category.color : "transparent",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    </Box>
  );
};

export default CategoryListPage;
