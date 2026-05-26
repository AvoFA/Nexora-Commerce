import React, { useState } from "react";
import {
  ExpandMore as ExpandMoreIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import "./Pagination.scss";

/**
 * Generates the array of page numbers / ellipsis strings to render.
 * E.g. [1, '...', 4, 5, 6, '...', 23]
 */
const buildPages = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const addPage = (p) => pages.push(p);
  const addDots = () => {
    if (pages[pages.length - 1] !== "...") pages.push("...");
  };

  addPage(1);

  if (current <= 4) {
    for (let i = 2; i <= Math.min(5, total - 1); i++) addPage(i);
    addDots();
  } else if (current >= total - 3) {
    addDots();
    for (let i = Math.max(total - 4, 2); i <= total - 1; i++) addPage(i);
  } else {
    addDots();
    for (let i = current - 1; i <= current + 1; i++) addPage(i);
    addDots();
  }

  addPage(total);
  return pages;
};

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
  onLoadMore,
  hasMore = false,
  loadMoreLabel = "Показати ще",
  simpleMode = false,
}) => {
  const [isLimitOpen, setIsLimitOpen] = useState(false);

  if (totalPages <= 0 || total <= 0) return null;

  const pages = buildPages(page, totalPages);

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page || isLoading) return;
    onPageChange?.(p);
  };

  return (
    <div className={`custom-pagination-container ${className}`}>
      {onLoadMore && hasMore && (
        <>
          <div className="pagination-load-more-row">
            <button
              type="button"
              className="pagination-load-more-btn"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              <AddIcon className="load-more-icon" />
              <span>{isLoading ? "Завантаження..." : loadMoreLabel}</span>
            </button>
          </div>
        </>
      )}

      <div className={`pagination-grid-row ${simpleMode ? "is-simple" : ""}`}>
        {/* ── Left: limit selector + total info ── */}
        {!simpleMode && (
          <div className="pagination-left">
            {showLimitSelector && onLimitChange && (
              <>
                <span className="pagination-meta-label">Показувати по:</span>
                <div className={`limit-select-wrapper ${isLimitOpen ? "is-open" : ""}`}>
                  <select
                    value={limit}
                    disabled={isLoading}
                    onMouseDown={(e) => {
                      setIsLimitOpen((prev) => {
                        const next = !prev;
                        if (!next) setTimeout(() => e.target.blur(), 0);
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
                      if (e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") setIsLimitOpen(true);
                      if (e.key === "Escape" || e.key === "Enter") setIsLimitOpen(false);
                    }}
                  >
                    {limitOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="select-chevron"><ExpandMoreIcon /></span>
                </div>
              </>
            )}
            <span className="pagination-total-info">
              Всього: <strong>{total}</strong>{itemLabel ? ` ${itemLabel}` : ""}
            </span>
          </div>
        )}

        {/* ── Center: page buttons ── */}
        <div className="pagination-center">
          <div className="pagination-actions">
            {/* First */}
            <button
              type="button"
              className="pagination-btn pagination-btn--icon"
              onClick={() => go(1)}
              disabled={page <= 1 || isLoading}
              title="Перша сторінка"
            >
              <FirstPageIcon />
            </button>

            {/* Prev */}
            <button
              type="button"
              className="pagination-btn pagination-btn--nav"
              onClick={() => go(page - 1)}
              disabled={page <= 1 || isLoading}
              title="Попередня сторінка"
            >
              <ChevronLeftIcon />
              <span>Назад</span>
            </button>

            {/* Page numbers */}
            <div className="pagination-pages">
              {pages.map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="pagination-dots">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`pagination-page-btn${p === page ? " is-active" : ""}`}
                    onClick={() => go(p)}
                    disabled={isLoading}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            {/* Next */}
            <button
              type="button"
              className="pagination-btn pagination-btn--nav"
              onClick={() => go(page + 1)}
              disabled={page >= totalPages || isLoading}
              title="Наступна сторінка"
            >
              <span>Вперед</span>
              <ChevronRightIcon />
            </button>

            {/* Last */}
            <button
              type="button"
              className="pagination-btn pagination-btn--icon"
              onClick={() => go(totalPages)}
              disabled={page >= totalPages || isLoading}
              title="Остання сторінка"
            >
              <LastPageIcon />
            </button>
          </div>
        </div>

        {/* ── Right: page counter ── */}
        {!simpleMode && (
          <div className="pagination-right">
            <span className="pagination-page-info">
              Стор. <strong>{page}</strong> / <strong>{totalPages}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
