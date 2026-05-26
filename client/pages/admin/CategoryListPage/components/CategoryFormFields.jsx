import { FormControl, TextField, InputAdornment, IconButton } from "@mui/material";
import { LockOutlined, LockOpenOutlined } from "@mui/icons-material";
import CategoryAttributesManager from "./CategoryAttributesManager.jsx";

const CategoryFormFields = ({
  formData,
  isSlugLocked,
  onToggleSlugLock,
  onFieldChange,
  onAddAttribute,
  onAttributeChange,
  onRemoveAttribute,
}) => {
  return (
    <>
      <div className="category-form-section">
        <div className="category-form-section-heading">
          <h6>Основна інформація</h6>
          <p>Вкажіть назву категорії та її унікальний ідентифікатор в системі.</p>
        </div>

        <div className="category-form-grid">
          <FormControl className="mui-form-control" fullWidth>
            <TextField
              label="Назва категорії"
              value={formData.description}
              onChange={(event) => onFieldChange("description", event.target.value)}
              helperText="напр. Смартфони"
              required
            />
          </FormControl>

          <FormControl className="mui-form-control" fullWidth>
            <TextField
              label="Системний ID (англійською)"
              value={formData.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              disabled={isSlugLocked}
              helperText="Унікальний ідентифікатор (напр. phones)"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={onToggleSlugLock}
                      edge="end"
                      title={isSlugLocked ? "Розблокувати для ручного редагування" : "Заблокувати автогенерацію"}
                    >
                      {isSlugLocked ? <LockOutlined fontSize="small" /> : <LockOpenOutlined fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </div>
      </div>

      <CategoryAttributesManager
        attributes={formData.defaultAttributes}
        onAddAttribute={onAddAttribute}
        onAttributeChange={onAttributeChange}
        onRemoveAttribute={onRemoveAttribute}
      />
    </>
  );
};

export default CategoryFormFields;
