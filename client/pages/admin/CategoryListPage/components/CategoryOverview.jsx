import React from "react";
import { Box } from "@mui/material";
import { getCategoryIcon } from "./categoryIcons.jsx";

const CategoryOverview = ({ categories, totalProducts }) => {
  return (
    <Box className="admin-solid-card category-overview-card ">
      <h3 className="category-overview-title">Огляд категорій</h3>
      <div className="overview-list">
        {categories.map((category) => {
          const count = category.count || 0;
          const percentage =
            totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;

          return (
            <div key={category.id} className="admin-category-stat-row">
              <div className="category-stat-details">
                <div
                  className="stat-icon-wrapper"
                  style={{ background: category.color }}
                >
                  {React.cloneElement(getCategoryIcon(category.icon), {
                    sx: { width: 24, height: 24 },
                  })}
                </div>
                <span className="stat-name">{category.name}</span>
              </div>
              <div className="category-stat-progress">
                <div className="stat-count-info">
                  <p className="stat-count-value">{count} товарів</p>
                  <p className="stat-count-percent">
                    {percentage}% від загальної
                  </p>
                </div>
                <div className="stat-progress-bar-container">
                  <div
                    className="stat-progress-bar"
                    style={{
                      width: `${percentage}%`,
                      background:
                        percentage > 0 ? category.color : "transparent",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

export default CategoryOverview;
