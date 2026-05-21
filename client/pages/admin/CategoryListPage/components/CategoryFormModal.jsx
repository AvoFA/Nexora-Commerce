import { Backdrop, Box, Fade, Modal, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import CategoryFormFields from "./CategoryFormFields.jsx";

const CategoryFormModal = ({
  open,
  editingId,
  formData,
  isSaving,
  onClose,
  onSave,
  onFieldChange,
  onAddAttribute,
  onAttributeChange,
  onRemoveAttribute,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: { timeout: 250, className: "admin-modal-backdrop" },
      }}
    >
      <Fade in={open} timeout={250}>
        <Box className="admin-modal-wrapper">
          <div className="admin-modal-card admin-solid-card category-form-modal-card">
            <button
              type="button"
              onClick={onClose}
              className="admin-modal-close-btn"
            >
              <CloseIcon />
            </button>

            <div className="admin-modal-header">
              <Typography variant="h5" component="h2">
                {editingId ? "Редагувати категорію" : "Додати категорію"}
              </Typography>
              <p className="category-modal-subtitle">
                Вкажіть назву, ідентифікатор та характеристики за замовчуванням для цієї категорії товарів.
              </p>
            </div>

            <div className="admin-modal-content">
              <form
                id="cat-form"
                onSubmit={onSave}
                className="category-form"
              >
                <CategoryFormFields
                  formData={formData}
                  onFieldChange={onFieldChange}
                  onAddAttribute={onAddAttribute}
                  onAttributeChange={onAttributeChange}
                  onRemoveAttribute={onRemoveAttribute}
                />
              </form>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSaving}
              >
                Скасувати
              </button>
              <button
                type="submit"
                form="cat-form"
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

export default CategoryFormModal;
