import { Rating, FormHelperText, Tooltip } from "@mui/material";
import { Star, InfoOutlined } from "@mui/icons-material";

const ReviewForm = ({
  showForm,
  setShowForm,
  newReview,
  setNewReview,
  formErrors,
  setFormErrors,
  handleSubmitReview,
  isEditing,
  className = "",
}) => {
  return (
    <div className={`review-form-fields-wrapper ${className}`.trim()}>
      <div className="review-form-header-simple">
        <Tooltip
          title={
            <div style={{ padding: "8px", fontSize: "13px", lineHeight: "1.6" }}>
              <b style={{ display: "block", marginBottom: "6px", color: "#fbbf24" }}>
                Що містить відгук, який точно НЕ опублікують?
              </b>
              <ul style={{ margin: 0, paddingLeft: "16px", listStyleType: "disc" }}>
                <li>Нецензурну лексику</li>
                <li>Посилання на сторонні ресурси або згадки про інші магазини</li>
                <li>Спам та відкриту рекламу</li>
                <li>Відгуки про обслуговування</li>
              </ul>
            </div>
          }
          arrow
          placement="top"
        >
          <div className="moderation-notice">
            <InfoOutlined sx={{ fontSize: "18px" }} />
            <span>Перед публікацією відгук проходить модерацію.</span>
          </div>
        </Tooltip>
      </div>

      <div className="review-form-fields">
        <div className="form-field rating-field review-rating-field">
          <label>Оцінити товар*</label>
          <div className="star-picker">
            <Rating
              name="review-stars"
              value={newReview.stars}
              onChange={(event, newValue) => {
                setNewReview((p) => ({ ...p, stars: newValue || 0 }));
                if (newValue) setFormErrors(prev => ({ ...prev, stars: null }));
              }}
              emptyIcon={<Star fontSize="inherit" />}
              sx={{
                fontSize: "2.5rem",
                color: "#fbbf24",
                "& .MuiRating-iconFilled, & .MuiRating-iconHover": {
                  color: "#fbbf24",
                },
                "& .MuiRating-iconEmpty": { color: "#475569" },
                "& .MuiRating-icon": {
                  marginRight: "8px",
                  transition: "transform 0.2s ease-in-out",
                },
                "& .MuiRating-icon:hover": {
                  transform: "scale(1.1)",
                },
              }}
            />
          </div>
          {formErrors.stars && (
            <FormHelperText error sx={{ fontSize: "0.85rem", fontWeight: 500, mt: 0, mb: 1 }}>
              {formErrors.stars}
            </FormHelperText>
          )}
        </div>

        <div className="form-group review-name-field">
          <label htmlFor="review-name">Ім'я*</label>
          <input
            id="review-name"
            type="text"
            className={`form-input ${formErrors.name ? "has-error" : ""}`}
            placeholder="Ваше ім'я"
            value={newReview.name}
            onChange={(e) => {
              setNewReview((p) => ({ ...p, name: e.target.value }));
              if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, name: null }));
            }}
          />
          {formErrors.name && <div className="error-message">{formErrors.name}</div>}
        </div>

        <div className="form-group review-text-field">
          <label htmlFor="review-text">Ваш коментар*</label>
          <textarea
            id="review-text"
            className={`form-input ${formErrors.text ? "has-error" : ""}`}
            placeholder="Розкажіть про товар..."
            rows={4}
            value={newReview.text}
            onChange={(e) => {
              const val = e.target.value;
              setNewReview((p) => ({ ...p, text: val }));
              
              // Real-time validation: show error immediately on typing
              if (val.length > 0 && val.trim().length < 10) {
                setFormErrors((prev) => ({ 
                  ...prev, 
                  text: "Введіть не менш ніж 10 символів" 
                }));
              } else {
                setFormErrors((prev) => ({ ...prev, text: null }));
              }
            }}
          />
          {formErrors.text && <div className="error-message">{formErrors.text}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="review-pros">Переваги</label>
            <input
              id="review-pros"
              type="text"
              className="form-input"
              placeholder="Що сподобалось?"
              value={newReview.pros}
              onChange={(e) =>
                setNewReview((p) => ({ ...p, pros: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="review-cons">Недоліки</label>
            <input
              id="review-cons"
              type="text"
              className="form-input"
              placeholder="Що не сподобалось?"
              value={newReview.cons}
              onChange={(e) =>
                setNewReview((p) => ({ ...p, cons: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn-primary btn-with-icon review-submit-button">
        {isEditing ? "Зберегти зміни" : "Додати відгук"}
      </button>
    </div>
  );
};

export default ReviewForm;
