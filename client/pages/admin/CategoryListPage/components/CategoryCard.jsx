import React, { useState } from "react";
import { Chip, IconButton, Typography } from "@mui/material";
import { Delete, Edit, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { getCategoryIcon } from "./categoryIcons.jsx";

const getFilledAttributes = (category) =>
  (category.defaultAttributes || []).filter(
    (attr) => attr.key && attr.key.trim() !== "",
  );

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const filledAttributes = getFilledAttributes(category);

  return (
    <div className={`admin-category-card ${isExpanded ? "is-expanded" : ""}`}>
      <div className="category-card-header">
        <div className="category-icon-wrapper">
          {React.cloneElement(getCategoryIcon(category.icon), {
            className: "category-card-icon",
          })}
        </div>
        <div className="category-info">
          <Typography className="mobile-category-name">{category.name}</Typography>
          {category.description && (
            <Typography className="mobile-category-description">
              {category.description}
            </Typography>
          )}
        </div>
        <div className="category-card-actions">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(category)}
            className="action-btn"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(category)}
            className="action-btn"
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
      </div>

      <div className="category-card-meta">
        <span className="category-products-badge">
          {category.count || 0} товарів
        </span>
        {filledAttributes.length > 0 ? (
          <button
            type="button"
            className="category-attrs-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {filledAttributes.length} х-тик
            <ExpandMoreIcon className={`toggle-chevron ${isExpanded ? "rotated" : ""}`} />
          </button>
        ) : (
          <span className="category-attrs-empty">
            Немає х-тик
          </span>
        )}
      </div>

      {isExpanded && filledAttributes.length > 0 && (
        <div className="category-expanded-panel">
          <div className="category-attributes-chips">
            {filledAttributes.map((attr, index) => (
              <Chip
                key={`${attr.key}-${index}`}
                size="small"
                label={attr.key}
                className="category-attribute-chip"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
