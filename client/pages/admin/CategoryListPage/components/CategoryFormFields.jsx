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
          label="ID (Англійською)"
          value={formData.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          helperText="Унікальний ідентифікатор (напр. phones)"
          required
        />
      </FormControl>

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
