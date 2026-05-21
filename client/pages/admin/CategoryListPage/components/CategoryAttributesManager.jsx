import { Button, FormControl, IconButton, TextField } from "@mui/material";
import { Add as AddIcon, DeleteOutline } from "@mui/icons-material";

const CategoryAttributesManager = ({
  attributes,
  onAddAttribute,
  onAttributeChange,
  onRemoveAttribute,
}) => {
  return (
    <div className="category-form-section category-attributes-section">
      <div className="category-form-section-header">
        <div className="category-form-section-heading">
          <h6>Характеристики товарів</h6>
          <p>Вкажіть назви характеристик за замовчуванням для товарів цієї категорії.</p>
        </div>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddAttribute}
          className="category-add-attribute-btn"
        >
          Додати
        </Button>
      </div>

      <div className="category-attributes-list">
        {attributes.map((attr, index) => (
          <div
            key={index}
            className="category-attribute-row"
          >
            <FormControl className="mui-form-control">
              <TextField
                size="small"
                label="Назва характеристики"
                value={attr.key}
                onChange={(event) =>
                  onAttributeChange(index, "key", event.target.value)
                }
                placeholder="напр. Діагональ, Пам'ять"
              />
            </FormControl>
            <IconButton
              color="error"
              onClick={() => onRemoveAttribute(index)}
              disabled={attributes.length <= 1}
              className="category-remove-attribute-btn"
            >
              <DeleteOutline />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryAttributesManager;
