import { CheckCircle, Close } from "@mui/icons-material";
import QuestionForm from "./QuestionForm.jsx";
import QuestionsList from "./QuestionsList.jsx";

const QuestionsPanel = ({
  questions,
  showQuestionForm,
  setShowQuestionForm,
  questionForm,
  setQuestionForm,
  questionErrors,
  setQuestionErrors,
  questionSuccess,
  setQuestionSuccess,
  isLoadingQuestions,
  handleSubmitQuestion,
}) => {
  return (
    <div className="questions-panel">
      {questionSuccess ? (
        <div className="review-success-banner">
          <CheckCircle className="success-icon" />
          <div className="banner-text">
            <strong>Дякуємо за ваше питання.</strong>
            <span>Після перевірки модератором воно з'явиться на сайті.</span>
          </div>
          <button
            type="button"
            className="close-banner"
            onClick={() => setQuestionSuccess(false)}
          >
            <Close />
          </button>
        </div>
      ) : (
        <form
          className={`reviews-interactive-card ${showQuestionForm ? "form-active" : "banner-active"}`}
          onSubmit={handleSubmitQuestion}
        >
          <div className="card-header-row">
            <h3 className="card-title">Задайте своє питання про товар</h3>

            {showQuestionForm ? (
              <button
                type="button"
                className="close-banner"
                onClick={() => setShowQuestionForm(false)}
                title="Скасувати"
              >
                <Close />
              </button>
            ) : (
              <button
                type="button"
                className="btn-cta"
                onClick={() => {
                  setQuestionSuccess(false);
                  setShowQuestionForm(true);
                }}
              >
                Задати питання
              </button>
            )}
          </div>

          <div className="form-collapsible-wrapper">
            <div className="form-collapsible-content">
              <QuestionForm
                questionForm={questionForm}
                setQuestionForm={setQuestionForm}
                questionErrors={questionErrors}
                setQuestionErrors={setQuestionErrors}
              />
            </div>
          </div>
        </form>
      )}

      <QuestionsList questions={questions} isLoading={isLoadingQuestions} />
    </div>
  );
};

export default QuestionsPanel;
