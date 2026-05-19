import React, { useState } from "react";
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import "./Pagination.scss";

const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  limitOptions = [10, 20, 50],
  itemLabel = "замовлень",
  onPageChange,
  onLimitChange,
  isLoading = false,
  className = "",
  showLimitSelector = true,
  prevLabel = "Попередня",
  nextLabel = "Наступна",
}) => {
  const [isLimitOpen, setIsLimitOpen] = useState(false);

  if (totalPages <= 0 || total <= 0) return null;

  return (
    <div className={`admin-pagination-container ${className}`}>
      <div className="pagination-left">
        {showLimitSelector && (
          <>
            <span>Показувати по:</span>
            <div className={`limit-select-wrapper ${isLimitOpen ? "is-open" : ""}`}>
              <select
                value={limit}
                disabled={isLoading}
                onMouseDown={(e) => {
                  setIsLimitOpen((prev) => {
                    const next = !prev;
                    if (!next) {
                      setTimeout(() => e.target.blur(), 0);
                    }
                    return next;
                  });
                }}
                onChange={(e) => {
                  onLimitChange?.(parseInt(e.target.value, 10));
                  setIsLimitOpen(false);
                  e.target.blur();
                }}
                onBlur={() => setIsLimitOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
                    setIsLimitOpen(true);
                  }
                  if (e.key === "Escape" || e.key === "Enter") {
                    setIsLimitOpen(false);
                  }
                }}
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="select-chevron">
                <ExpandMoreIcon />
              </span>
            </div>
          </>
        )}
      </div>

      <div className="pagination-center">
        <div className="pagination-actions">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1 || isLoading}
            title={`${prevLabel} сторінка`}
          >
            <ArrowBackIcon />
            <span>{prevLabel}</span>
          </button>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages || isLoading}
            title={`${nextLabel} сторінка`}
          >
            <span>{nextLabel}</span>
            <ArrowForwardIcon />
          </button>
        </div>
      </div>

      <div className="pagination-right">
        <div className="pagination-info">
          Сторінка <span className="total-count">{page}</span> з{" "}
          <span className="total-count">{totalPages || 1}</span> (всього:{" "}
          <span className="total-count">{total}</span>
          {itemLabel ? ` ${itemLabel}` : ""})
        </div>
      </div>
    </div>
  );
};

export default Pagination;
