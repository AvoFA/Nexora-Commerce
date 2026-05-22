import { formatDate, formatDateTime } from "../../../utils/dateFormatters";

export { escapeRegExp, highlightMatch } from "../../../utils/searchHighlight";

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

export const formatModerationListDate = (date) =>
  formatDate(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatModerationDetailsDate = (date) =>
  formatDateTime(
    date,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
    {
      hour: "2-digit",
      minute: "2-digit",
    },
    "Невідомо",
  );
