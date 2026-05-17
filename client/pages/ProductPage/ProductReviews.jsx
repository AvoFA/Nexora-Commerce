import { Rating } from "@mui/material";
import { Star, CheckCircle } from "@mui/icons-material";
import ReviewForm from "./ReviewForm.jsx";

const ProductReviews = ({
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
  isEditing,
  setIsEditing,
}) => {
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

  const renderReviewAction = () => {
    if (userReview?.status === "pending") {
      return (
        <div className="review-pending-notice" style={{ marginTop: '20px', padding: '12px', background: '#334155', borderRadius: '8px', border: '1px solid #475569' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', textAlign: 'center' }}>
            Ваш відгук вже очікує модерації
          </p>
        </div>
      );
    }

    if (userReview?.status === "approved") {
      return (
        <button
          className="btn-write-review"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setIsEditing(false);
            } else {
              handleEditClick();
            }
          }}
        >
          {showForm ? "Скасувати" : "Редагувати відгук"}
        </button>
      );
    }

    if (userReview?.status === "rejected") {
      return (
        <button
          className="btn-write-review"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setIsEditing(false);
            } else {
              handleEditClick();
            }
          }}
          style={{ background: '#ef4444', borderColor: '#ef4444' }}
        >
          {showForm ? "Скасувати" : "Написати новий відгук"}
        </button>
      );
    }

    return (
      <button
        className="btn-write-review"
        onClick={() => {
          setShowForm((v) => !v);
          setIsEditing(false);
        }}
      >
        {showForm ? "Скасувати" : "Написати відгук"}
      </button>
    );
  };
  return (
    <section className="reviews-section bottom-layout">
      <h2 className="section-title">Відгуки клієнтів</h2>

      <div className="reviews-layout-grid">
        {/* Левый sidebar */}
        <div className="reviews-summary-side">
          <div className="reviews-summary">
            <div className="rating-big">{avgRating}</div>
            <div className="rating-info">
              <div className="stars">
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
              </div>                <div className="total-reviews">
                На основі {reviews.length} відгуків
              </div>
            </div>
          </div>

          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="rating-bar-row">
                <span className="star-num">{star}★</span>
                <div className="bar-bg">
                  <div
                    className="bar-fill"
                    style={{ width: (stats[star]?.percent || 0) + "%" }}
                  />
                </div>
                <span className="bar-percent">
                  {stats[star]?.percent || 0}%
                </span>
              </div>
            ))}
          </div>

          {renderReviewAction()}
        </div>

        {/* Правая зона */}
        <div className="reviews-content-side">
          {/* Форма (показывается по кнопке) */}
          <ReviewForm
            showForm={showForm}
            setShowForm={setShowForm}
            newReview={newReview}
            setNewReview={setNewReview}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            handleSubmitReview={handleSubmitReview}
          />

          <div className="reviews-list-header">
            <div className="rating-filters">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  className={`filter-chip ${ratingFilter === star ? "active" : ""}`}
                  onClick={() =>
                    setRatingFilter(ratingFilter === star ? null : star)
                  }
                >
                  <Star sx={{ fontSize: "14px", mr: "2px" }} /> {star}
                </button>
              ))}
            </div>

          </div>

          {/* Список отзывов */}
          <div className="reviews-list">
            {reviews
              .filter((r) => (ratingFilter ? r.stars === ratingFilter : true))
              .map((review) => (
                <div key={review.id} className="review-item">

                <div className="review-header">
                  <div className="review-author-block">
                    <span className="user-name">{review.name}</span>
                    {review.verified && (
                      <span className="verified-badge">
                        <CheckCircle sx={{ fontSize: "13px" }} />
                        Підтверджена покупка
                      </span>
                    )}
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>

                {review.model && (
                  <span className="review-model-tag">{review.model}</span>
                )}

                <div className="review-stars">
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
            ))}
          </div>

          {reviews.length > 0 && (
            <button className="btn-all-reviews">
              Всі відгуки ({reviews.length})
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
