import React from "react";
import { Chip } from "@mui/material";

const AdminFilterTabs = ({
  activeTab,
  onChange,
  tabs = [],
  counts = {},
  ariaLabel,
}) => {
  return (
    <div className="filter-tabs" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const count = counts[tab.value] || 0;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`filter-tab-button ${isActive ? "active" : ""}`}
          >
            <span>{tab.label}</span>
            <Chip label={count} size="small" />
          </button>
        );
      })}
    </div>
  );
};

export default AdminFilterTabs;
