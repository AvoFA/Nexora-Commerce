import React from "react";
import { Refresh as RefreshIcon } from "@mui/icons-material";

const AdminRefreshButton = ({
  onClick,
  isLoading,
  className = "refresh-btn",
  iconClassName = "",
  title = "Оновити дані",
}) => {
  return (
    <button
      type="button"
      className={`${className} ${isLoading ? "is-loading" : ""}`}
      onClick={onClick}
      disabled={isLoading}
      title={title}
    >
      <RefreshIcon className={iconClassName} />
    </button>
  );
};

export default AdminRefreshButton;
