import { useState, useEffect } from "react";
import { Backdrop, Box, Fade, Modal, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  CategoryOutlined,
  EditOutlined,
  InfoOutlined as InfoIcon,
  TuneOutlined as AttrsIcon,
} from "@mui/icons-material";
import CategoryBasicTab from "./tabs/CategoryBasicTab.jsx";
import CategoryAttributesTab from "./tabs/CategoryAttributesTab.jsx";

const CategoryFormModal = ({
  open,
  editingId,
  formData,
  isSaving,
  isSlugLocked,
  onToggleSlugLock,
  onClose,
  onSave,
  onFieldChange,
  onAddGroup,
  onRemoveGroup,
  onGroupNameChange,
  onAddItem,
  onRemoveItem,
  onItemChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open) setActiveTab(0);
  }, [open]);

  const attrCount = formData.defaultAttributes?.reduce(
    (sum, g) => sum + (g.items?.length || 0),
    0
  ) ?? 0;

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
          <div className="admin-modal-card admin-solid-card category-form-modal-card tabbed-layout-card">
            <button
              type="button"
              onClick={onClose}
              className="admin-modal-close-btn"
            >
              <CloseIcon />
            </button>

            <div className="admin-modal-header">
              <div className="category-modal-title-row">
                <div className="category-modal-title-icon">
                  {editingId ? <EditOutlined fontSize="small" /> : <CategoryOutlined fontSize="small" />}
                </div>
                <div>
                  <Typography variant="h5" component="h2">
                    {editingId ? "Редагувати категорію" : "Нова категорія"}
                  </Typography>
                  <p className="category-modal-subtitle">
                    {editingId
                      ? "Змініть назву, ID або характеристики цієї категорії."
                      : "Вкажіть назву, ідентифікатор та характеристики за замовчуванням."}
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-modal-segmented-tabs">
              <div className="segmented-tabs-container">
                <button
                  type="button"
                  className={`segmented-tab-btn${activeTab === 0 ? " is-active" : ""}`}
                  onClick={() => setActiveTab(0)}
                >
                  <InfoIcon fontSize="small" />
                  <span>Основна інформація</span>
                </button>
                <button
                  type="button"
                  className={`segmented-tab-btn${activeTab === 1 ? " is-active" : ""}`}
                  onClick={() => setActiveTab(1)}
                >
                  <AttrsIcon fontSize="small" />
                  <span>Характеристики</span>
                  {attrCount > 0 && (
                    <span className="segmented-tab-badge">{attrCount}</span>
                  )}
                </button>
              </div>
            </div>

            <div className="admin-modal-content">
              <form
                id="cat-form"
                onSubmit={onSave}
                className="category-form"
              >
                {activeTab === 0 && (
                  <CategoryBasicTab
                    formData={formData}
                    isSlugLocked={isSlugLocked}
                    onToggleSlugLock={onToggleSlugLock}
                    onFieldChange={onFieldChange}
                  />
                )}
                {activeTab === 1 && (
                  <CategoryAttributesTab
                    formData={formData}
                    onAddGroup={onAddGroup}
                    onRemoveGroup={onRemoveGroup}
                    onGroupNameChange={onGroupNameChange}
                    onAddItem={onAddItem}
                    onRemoveItem={onRemoveItem}
                    onItemChange={onItemChange}
                  />
                )}
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
