import React from "react";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";

const AdminSearchInput = ({
  value,
  onChange,
  onClear,
  placeholder,
  disabled = false,
  className = "search-input-wrapper",
  inputClassName = "",
  showIconWrapper = true,
}) => {
  return (
    <div className={className}>
      {showIconWrapper ? (
        <span className="search-icon-wrapper">
          <SearchIcon className="search-icon" />
        </span>
      ) : (
        <SearchIcon className="search-icon" />
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName}
        disabled={disabled}
      />
      {value && (
        <button
          type="button"
          className="clear-search-btn"
          onClick={onClear}
          title="Очистити пошук"
          disabled={disabled}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default AdminSearchInput;
