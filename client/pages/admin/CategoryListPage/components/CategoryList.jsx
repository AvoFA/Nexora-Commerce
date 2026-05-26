import React, { useState } from "react";
import {
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Delete,
  Edit,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import CategoryCard from "./CategoryCard.jsx";
import { getCategoryIcon } from "./categoryIcons.jsx";
import { highlightMatch } from "../../../../utils/searchHighlight.jsx";

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

  // If no groups — just flat chips
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

const CategoryListEmpty = ({ children }) => (
  <Typography className="category-list-empty">{children}</Typography>
);

const CategoryDesktopItem = ({ category, onEdit, onDelete, searchTerm }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const attrCount = getFilledAttributesCount(category);
  const hasAttrs = attrCount > 0;

  return (
    <div className={`category-item-wrapper ${isExpanded ? "is-expanded" : ""}`}>
      <div className="category-item-row">
        <div
          className={`category-item-main${hasAttrs ? " is-clickable" : ""}`}
          onClick={() => hasAttrs && setIsExpanded((v) => !v)}
        >
          <div className="category-item-icon-wrapper">
            {React.cloneElement(getCategoryIcon(category.icon), {
              className: "category-item-icon",
            })}
          </div>

          <div className="category-item-info">
            <Typography className="category-item-name">
              {highlightMatch(category.name, searchTerm)}
            </Typography>
            {category.description && (
              <Typography className="category-item-description">
                {highlightMatch(category.description, searchTerm)}
              </Typography>
            )}
          </div>

          {hasAttrs && (
            <ExpandMoreIcon
              className={`category-inline-chevron${isExpanded ? " rotated" : ""}`}
            />
          )}
        </div>

        <div className="category-item-meta">
          <span className="category-products-badge">
            {category.count || 0} товарів
          </span>
          {hasAttrs ? (
            <span className="category-attrs-count-badge">
              {attrCount} характ.
            </span>
          ) : (
            <span className="category-attrs-empty">Немає характеристик</span>
          )}
        </div>

        <div className="category-item-actions">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(category)}
            title="Редагувати"
            className="action-btn edit-btn"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(category)}
            title="Видалити"
            className="action-btn delete-btn"
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
      </div>

      {isExpanded && hasAttrs && (
        <div className="category-expanded-panel">
          <div className="expanded-panel-header">
            Характеристики для автозаповнення товарів:
          </div>
          <AttributeGroups category={category} />
        </div>
      )}
    </div>
  );
};

const CategoryList = ({
  categories,
  filteredCategories,
  searchTerm,
  loading,
  onEdit,
  onDelete,
}) => {
  const emptyText = searchTerm
    ? `Категорії з назвою "${searchTerm}" не знайдено`
    : "Немає даних для відображення";

  return (
    <>
      <div className="mobile-only-view">
        {loading ? (
          <CategoryListEmpty>Завантаження...</CategoryListEmpty>
        ) : filteredCategories.length === 0 ? (
          <CategoryListEmpty>{emptyText}</CategoryListEmpty>
        ) : (
          <div className="admin-mobile-categories">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      <div className="desktop-only-view">
        {loading ? (
          <CategoryListEmpty>Завантаження...</CategoryListEmpty>
        ) : categories.length === 0 ? (
          <CategoryListEmpty>Немає даних для відображення</CategoryListEmpty>
        ) : filteredCategories.length === 0 ? (
          <CategoryListEmpty>{emptyText}</CategoryListEmpty>
        ) : (
          <div className="category-list-card">
            {filteredCategories.map((category) => (
              <CategoryDesktopItem
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryList;
