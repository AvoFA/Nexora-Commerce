import React from "react";
import { Button } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { getCategoryIcon } from "./categoryIcons.jsx";

const getFilledAttributes = (category) =>
  (category.defaultAttributes || []).filter(
    (attr) => attr.key && attr.key.trim() !== "",
  );

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const filledAttributes = getFilledAttributes(category);

  return (
    <div className="admin-category-card">
      <div className="category-card-header">
        <div className="category-icon">
          {React.cloneElement(getCategoryIcon(category.icon), {
            sx: { width: 60, height: 60, color: "#3A86FF" },
            className: "category-card-icon-svg",
          })}
        </div>
        <div className="category-info">
          <h4 className="mobile-category-name">{category.name}</h4>
          <p className="mobile-category-description">
            {category.description || "Немає опису"}
          </p>
        </div>
      </div>

      <div className="category-card-stats">
        <div className="category-products-count">
          {category.count || 0} товарів
        </div>
        {filledAttributes.length > 0 && (
          <div className="category-attributes-count">
            {filledAttributes.length} характеристик
          </div>
        )}
      </div>

      <div className="category-card-actions">
        <Button
          size="small"
          variant="outlined"
          startIcon={<Delete />}
          onClick={() => onDelete(category)}
          fullWidth
          className="category-action-button danger"
        >
          Видалити
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<Edit />}
          onClick={() => onEdit(category)}
          fullWidth
          className="category-action-button"
        >
          Редагувати
        </Button>
      </div>
    </div>
  );
};

export default CategoryCard;
