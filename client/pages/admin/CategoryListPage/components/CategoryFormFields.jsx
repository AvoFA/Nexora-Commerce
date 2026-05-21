import { FormControl, TextField } from "@mui/material";
import CategoryAttributesManager from "./CategoryAttributesManager.jsx";

const CategoryFormFields = ({
  formData,
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
              helperText="Унікальний ідентифікатор (напр. phones)"
              required
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
