import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import {
  Delete,
  Edit,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import CategoryCard from "./CategoryCard.jsx";
import { getCategoryIcon } from "./categoryIcons.jsx";

const getFilledAttributes = (category) =>
  (category.defaultAttributes || []).filter(
    (attr) => attr.key && attr.key.trim() !== "",
  );

const CategoryListEmpty = ({ children }) => (
  <Typography className="category-list-empty">
    {children}
  </Typography>
);

const CategoryDesktopItem = ({ category, onEdit, onDelete }) => {
  const filledAttributes = getFilledAttributes(category);

  return (
    <Accordion
      key={category.id}
      className="category-accordion"
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon className="category-accordion-expand-icon" />}
        className="category-accordion-summary"
      >
        <div className="category-accordion-main">
          {React.cloneElement(getCategoryIcon(category.icon), {
            className: "category-accordion-icon",
          })}

          <div className="category-accordion-info">
            <Typography variant="h6" className="category-accordion-title">
              {category.name}
            </Typography>
            <Typography variant="body2" className="category-accordion-description">
              {category.description || "Немає опису"}
            </Typography>
          </div>

          <Chip
            label={`${category.count || 0} товарів`}
            size="small"
            className="category-count-chip"
          />
        </div>
      </AccordionSummary>

      <AccordionDetails className="category-accordion-details">
        <div className="category-detail-actions">
          <Button
            startIcon={<Delete />}
            size="small"
            variant="outlined"
            onClick={() => onDelete(category)}
            className="category-action-button danger"
          >
            Видалити
          </Button>
          <Button
            startIcon={<Edit />}
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => onEdit(category)}
            className="category-action-button"
          >
            Редагувати
          </Button>
        </div>

        {filledAttributes.length > 0 && (
          <div className="category-attributes-preview">
            <Typography variant="body2" className="category-attributes-preview-title">
              Характеристики ({filledAttributes.length})
            </Typography>
            <div className="category-attributes-chips">
              {filledAttributes.slice(0, 5).map((attr, index) => (
                <Chip
                  key={`${attr.key}-${index}`}
                  size="small"
                  label={attr.key}
                  variant="outlined"
                  color="primary"
                  className="category-attribute-chip"
                />
              ))}
              {filledAttributes.length > 5 && (
                <Chip
                  size="small"
                  label={`+${filledAttributes.length - 5}`}
                  variant="outlined"
                  color="default"
                  className="category-attribute-chip more"
                />
              )}
            </div>
          </div>
        )}
      </AccordionDetails>
    </Accordion>
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
          filteredCategories.map((category) => (
            <CategoryDesktopItem
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </>
  );
};

export default CategoryList;
