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

const getFilledAttributes = (category) =>
  (category.defaultAttributes || []).filter(
    (attr) => attr.key && attr.key.trim() !== "",
  );

const CategoryListEmpty = ({ children }) => (
  <Typography className="category-list-empty">
    {children}
  </Typography>
);

const CategoryDesktopItem = ({ category, onEdit, onDelete, searchTerm }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const filledAttributes = getFilledAttributes(category);

  return (
    <div className={`category-item-wrapper ${isExpanded ? "is-expanded" : ""}`}>
      <div className="category-item-row">
        <div className="category-item-main">
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
        </div>

        <div className="category-item-meta">
          <span className="category-products-badge">
            {category.count || 0} товарів
          </span>
          {filledAttributes.length > 0 ? (
            <button
              type="button"
              className="category-attrs-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {filledAttributes.length} характеристик
              <ExpandMoreIcon className={`toggle-chevron ${isExpanded ? "rotated" : ""}`} />
            </button>
          ) : (
            <span className="category-attrs-empty">
              Немає характеристик
            </span>
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

      {isExpanded && filledAttributes.length > 0 && (
        <div className="category-expanded-panel">
          <div className="expanded-panel-header">
            Характеристики для автозаповнення товарів:
          </div>
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
