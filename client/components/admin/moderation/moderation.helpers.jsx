import React from "react";

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const highlightMatch = (text, query) => {
  if (!text) return "";
  if (!query || !query.trim()) return text;

  const trimmedQuery = query.trim();
  const parts = String(text).split(
    new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi"),
  );

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

export const renderStars = (rating) => {
  const numRating = Number(rating) || 0;
  let ratingClass = "rating-high";
  if (numRating <= 2) {
    ratingClass = "rating-low";
  } else if (numRating === 3) {
    ratingClass = "rating-medium";
  }

  return (
    <div className={`rating-badge ${ratingClass}`}>
      <span className="rating-star">★</span>
      <span className="rating-value">{numRating}</span>
    </div>
  );
};

export const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const statusLabelMap = {
  pending: "На модерації",
  approved: "Опубліковано",
  rejected: "Відхилено",
};
