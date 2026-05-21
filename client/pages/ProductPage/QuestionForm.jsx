import { FormHelperText, Tooltip } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const QuestionForm = ({
  questionForm,
  setQuestionForm,
  questionErrors,
  setQuestionErrors,
}) => {
  return (
    <div className="review-form-fields-wrapper question-form-fields-wrapper">
      <div className="review-form-header-simple">
        <Tooltip
          title={
            <div style={{ padding: "8px", fontSize: "13px", lineHeight: "1.6" }}>
              Питання проходить модерацію перед публікацією на сторінці товару.
            </div>
          }
          arrow
          placement="top"
        >
          <div className="moderation-notice">
            <InfoOutlined sx={{ fontSize: "18px" }} />
            <span>Перед публікацією питання проходить модерацію.</span>
          </div>
        </Tooltip>
      </div>

      <div className="review-form-fields">
        <div className="form-group">
          <label htmlFor="question-name">Ім'я*</label>
          <input
            id="question-name"
            type="text"
            className={`form-input ${questionErrors.name ? "has-error" : ""}`}
            placeholder="Ваше ім'я"
            value={questionForm.name}
            onChange={(event) => {
              const value = event.target.value;
              setQuestionForm((prev) => ({ ...prev, name: value }));
              if (value.trim()) {
                setQuestionErrors((prev) => ({ ...prev, name: null }));
              }
            }}
          />
          {questionErrors.name && (
            <div className="error-message">{questionErrors.name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="question-text">Коментар*</label>
          <textarea
            id="question-text"
            className={`form-input ${questionErrors.text ? "has-error" : ""}`}
            placeholder="Що ви хочете дізнатися про товар?"
            rows={4}
            value={questionForm.text}
            onChange={(event) => {
              const value = event.target.value;
              setQuestionForm((prev) => ({ ...prev, text: value }));
              if (value.length > 0 && value.trim().length < 10) {
                setQuestionErrors((prev) => ({
                  ...prev,
                  text: "Введіть не менше ніж 10 символів",
                }));
              } else {
                setQuestionErrors((prev) => ({ ...prev, text: null }));
              }
            }}
          />
          {questionErrors.text && (
            <FormHelperText error sx={{ fontSize: "0.85rem", fontWeight: 500, mt: 0 }}>
              {questionErrors.text}
            </FormHelperText>
          )}
        </div>
      </div>

      <button type="submit" className="btn-primary btn-with-icon question-submit-button">
        Надіслати питання
      </button>
    </div>
  );
};

export default QuestionForm;
