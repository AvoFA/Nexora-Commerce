import React, { useState } from "react";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import "./CustomSelect.scss";

const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  isLoading = false,
  className = "",
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`filter-select-wrapper ${className}`}>
      {label && <label className="select-label" htmlFor={id}>{label}</label>}
      <div className={`select-relative ${isOpen ? "is-open" : ""}`}>
        <select
          id={id}
          value={value}
          disabled={isLoading}
          onMouseDown={(e) => {
            setIsOpen((prev) => {
              const next = !prev;
              if (!next) {
                setTimeout(() => e.target.blur(), 0);
              }
              return next;
            });
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(false);
            e.target.blur();
          }}
          onBlur={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (
              e.key === " " ||
              e.key === "ArrowDown" ||
              e.key === "ArrowUp"
            ) {
              setIsOpen(true);
            }
            if (e.key === "Escape" || e.key === "Enter") {
              setIsOpen(false);
            }
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="select-chevron">
          <ExpandMoreIcon />
        </span>
      </div>
    </div>
  );
};

export default CustomSelect;
