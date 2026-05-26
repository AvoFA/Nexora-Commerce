import React, { useState } from "react";
import { Chip, IconButton, Typography } from "@mui/material";
import { Delete, Edit, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { getCategoryIcon } from "./categoryIcons.jsx";

const AttributeGroups = ({ category }) => {
  const groups = category.defaultAttributes || [];
  const named = [];
  const ungrouped = [];

  groups.forEach((group) => {
    const items = (group.items || []).filter(
      (item) => item.key && item.key.trim() !== ""
    );
    if (!items.length) return;
    if (group.groupName && group.groupName.trim() !== "") {
      named.push({ name: group.groupName, items });
    } else {
      ungrouped.push(...items);
    }
  });

  if (named.length === 0) {
    return (
      <div className="attr-groups-container">
        <div className="attr-group-chips attr-group-chips--flat">
          {ungrouped.map((item, ii) => (
            <Chip
              key={`ungrouped-${item.key}-${ii}`}
              size="small"
              label={item.key}
              className="category-attribute-chip"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="attr-groups-container">
      {named.map((group) => (
        <div key={group.name} className="attr-group-block">
          <span className="attr-group-label">{group.name}</span>
          <div className="attr-group-chips">
            {group.items.map((item, ii) => (
              <Chip
                key={`${item.key}-${ii}`}
                size="small"
                label={item.key}
                className="category-attribute-chip"
              />
            ))}
          </div>
        </div>
      ))}
      {ungrouped.length > 0 && (
        <div className="attr-group-block">
          <span className="attr-group-label attr-group-label--ungrouped">—</span>
          <div className="attr-group-chips">
            {ungrouped.map((item, ii) => (
              <Chip
                key={`ungrouped-${item.key}-${ii}`}
                size="small"
                label={item.key}
                className="category-attribute-chip"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getFilledAttributesCount = (category) => {
  let count = 0;
  (category.defaultAttributes || []).forEach((group) => {
    (group.items || []).forEach((item) => {
      if (item.key && item.key.trim() !== "") count++;
    });
  });
  return count;
};

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const attrCount = getFilledAttributesCount(category);
  const hasAttrs = attrCount > 0;

  return (
    <div
      className={`admin-category-card ${isExpanded ? "is-expanded" : ""}`}
      onClick={() => hasAttrs && setIsExpanded((v) => !v)}
      style={{ cursor: hasAttrs ? "pointer" : "default" }}
    >
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
        <div className="category-card-actions" onClick={(e) => e.stopPropagation()}>
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
        {hasAttrs ? (
          <span className="category-attrs-toggle">
            {attrCount} х-тик
            <ExpandMoreIcon
              className={`toggle-chevron ${isExpanded ? "rotated" : ""}`}
            />
          </span>
        ) : (
          <span className="category-attrs-empty">Немає х-тик</span>
        )}
      </div>

      {isExpanded && hasAttrs && (
        <div className="category-expanded-panel">
          <AttributeGroups category={category} />
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
