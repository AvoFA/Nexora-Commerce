import { useMemo, useState } from "react";
import { Rating } from "@mui/material";
import { CheckCircle, Close, InfoOutlined, Star } from "@mui/icons-material";
import CustomSelect from "../../components/common/CustomSelect/CustomSelect.jsx";
import ReviewForm from "./ReviewForm.jsx";

const REVIEW_SORT_OPTIONS = [
  { value: "newest", label: "Спочатку нові" },
  { value: "oldest", label: "Спочатку старі" },
  { value: "rating-desc", label: "Найвища оцінка" },
  { value: "rating-asc", label: "Найнижча оцінка" },
];

const renderDistributionStars = (rating) => (
  <span className="distribution-stars" aria-label={`${rating} з 5`}>
    {Array.from({ length: rating }).map((_, index) => (
      <Star key={index} className="distribution-star filled" />
    ))}
  </span>
);

const ReviewsPanel = ({
  avgRating,
  reviews,
  stats,
  showForm,
  setShowForm,
  newReview,
  setNewReview,
  formErrors,
  setFormErrors,
  ratingFilter,
  setRatingFilter,
  handleSubmitReview,
  userReview,
  setIsEditing,
  showSuccess,
  setShowSuccess,
  mode = "full",
  previewLimit = 3,
}) => {
  const [reviewSort, setReviewSort] = useState("newest");
  const isPreview = mode === "preview";

  const handleEditClick = () => {
    if (userReview) {
      setNewReview((prev) => ({
        ...prev,
        stars: userReview.rating || 0,
        text: userReview.text || "",
        pros: userReview.pros || "",
        cons: userReview.cons || "",
      }));
      setIsEditing(true);
    }
    setShowForm(true);
  };

  const sortedReviews = useMemo(() => {
    const filteredReviews = reviews.filter((review) =>
      ratingFilter ? review.stars === ratingFilter : true
    );

    return [...filteredReviews].sort((firstReview, secondReview) => {
      if (reviewSort === "oldest") {
        return (firstReview.createdAtTime || 0) - (secondReview.createdAtTime || 0);
      }

      if (reviewSort === "rating-desc") {
        return secondReview.stars - firstReview.stars;
      }

      if (reviewSort === "rating-asc") {
        return firstReview.stars - secondReview.stars;
      }

      return (secondReview.createdAtTime || 0) - (firstReview.createdAtTime || 0);
    });
  }, [reviews, ratingFilter, reviewSort]);
  const displayedReviews = isPreview
    ? sortedReviews.slice(0, previewLimit)
    : sortedReviews;

  return (
    <div className="reviews-panel">
      {showSuccess ? (
        <div className="review-success-banner">
          <CheckCircle className="success-icon" />
          <div className="banner-text">
            <strong>Дякуємо за ваш відгук.</strong>
            <span>Після перевірки модератором він з'явиться на сайті.</span>
          </div>
          <button
            type="button"
            className="close-banner"
            onClick={() => {
              setShowSuccess(false);
              setShowForm(false);
            }}
          >
            <Close />
          </button>
        </div>
      ) : userReview?.status === "pending" ? (
        <div className="review-pending-banner">
          <InfoOutlined className="pending-icon" />
          <span>Ваш відгук вже очікує модерації та скоро з'явиться на сайті.</span>
        </div>
      ) : (
        <form
          className={`reviews-interactive-card ${showForm ? "form-active" : "banner-active"}`}
          onSubmit={handleSubmitReview}
        >
          <div className="card-header-row">
            <h3 className="card-title">Залиште свій відгук про цей товар</h3>

            {showForm ? (
              <button
                type="button"
                className="close-banner"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                }}
                title="Скасувати"
              >
                <Close />
              </button>
            ) : userReview?.status === "approved" ? (
              <button
                type="button"
                className="feedback-action-button"
                onClick={() => {
                  setShowSuccess(false);
                  handleEditClick();
                }}
              >
                Редагувати відгук
              </button>
            ) : userReview?.status === "rejected" ? (
              <button
                type="button"
                className="feedback-action-button"
                onClick={() => {
                  setShowSuccess(false);
                  handleEditClick();
                }}
              >
                Написати новий відгук
              </button>
            ) : (
              <button
                type="button"
                className="feedback-action-button"
                onClick={() => {
                  setShowSuccess(false);
                  setShowForm(true);
                  setIsEditing(false);
                }}
              >
                Залишити відгук
              </button>
            )}
          </div>

          <div className="form-collapsible-wrapper">
            <div className="form-collapsible-content">
              <ReviewForm
                showForm={showForm}
                setShowForm={setShowForm}
                newReview={newReview}
                setNewReview={setNewReview}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                handleSubmitReview={handleSubmitReview}
                className="product-review-form"
              />
            </div>
          </div>
        </form>
      )}

      <div className="feedback-stats">
        <div className="feedback-stats-summary">
          <div className="feedback-rating-value">{avgRating}</div>
          <div className="feedback-rating-info">
            <div className="feedback-rating-stars">
              <Rating
                value={Number(avgRating) || 0}
                precision={0.5}
                readOnly
                emptyIcon={<Star fontSize="inherit" />}
                sx={{
                  fontSize: "1.8rem",
                  color: "#fbbf24",
                  "& .MuiRating-iconEmpty": { color: "#475569" },
                  "& .MuiSvgIcon-root": { fontSize: "inherit" },
                }}
              />
            </div>
            <div className="feedback-rating-count">
              ({reviews.length} відгуків)
            </div>
          </div>
        </div>

        <div className="feedback-rating-bars">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="feedback-rating-row">
              {renderDistributionStars(star)}
              <div className="distribution-bar-track">
                <div
                  className="distribution-bar-fill"
                  style={{ width: `${stats[star]?.percent || 0}%` }}
                />
              </div>
              <span className="bar-count">{stats[star]?.count || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-list-header">
        <div className="rating-filters">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              className={`filter-chip ${ratingFilter === star ? "active" : ""}`}
              onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
            >
              <Star sx={{ fontSize: "14px", mr: "2px" }} /> {star}
            </button>
          ))}
        </div>
        <CustomSelect
          id="review-sort"
          className="feedback-sort-select"
          label="Сортування"
          value={reviewSort}
          onChange={setReviewSort}
          options={REVIEW_SORT_OPTIONS}
        />
      </div>

      <div className="feedback-reviews-list">
          {sortedReviews.length === 0 ? (
            <div className="questions-empty-state">
              Немає відгуків для обраного фільтра.
            </div>
          ) : (
            displayedReviews.map((review) => (
              <article key={review.id} className="feedback-review-item">
                <aside className="review-side-meta">
                  <Rating
                    value={review.stars}
                    readOnly
                    emptyIcon={<Star fontSize="inherit" />}
                    sx={{
                      fontSize: "1rem",
                      color: "#fbbf24",
                      "& .MuiRating-iconEmpty": { color: "#475569" },
                      "& .MuiSvgIcon-root": { fontSize: "inherit" },
                    }}
                  />
                  <span className="review-date">{review.date}</span>
                </aside>

                <div className="review-main-content">
                  <div className="review-author-block">
                    <span className="user-name">{review.name}</span>
                    {review.verified && (
                      <span className="verified-badge">
                        <CheckCircle sx={{ fontSize: "13px" }} />
                        Підтверджена покупка
                      </span>
                    )}
                  </div>

                  <p className="review-text">{review.text}</p>

                  {review.pros && (
                    <div className="review-pros">
                      <span className="pros-label">Переваги: </span>
                      {review.pros}
                    </div>
                  )}
                  {review.cons && (
                    <div className="review-cons">
                      <span className="cons-label">Недоліки: </span>
                      {review.cons}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
      </div>
    </div>
  );
};

export default ReviewsPanel;
