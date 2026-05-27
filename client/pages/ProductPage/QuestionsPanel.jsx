import { useMemo, useState, useEffect } from "react";
import { CheckCircle, Close } from "@mui/icons-material";
import CustomSelect from "../../components/common/CustomSelect/CustomSelect.jsx";
import QuestionForm from "./QuestionForm.jsx";
import QuestionsList from "./QuestionsList.jsx";
import Pagination from "../../components/common/Pagination/Pagination.jsx";

const QUESTION_FILTERS = [
  { key: "all", label: "Усі питання" },
  { key: "answered", label: "З відповіддю" },
  { key: "unanswered", label: "Без відповіді" },
];

const QUESTION_SORT_OPTIONS = [
  { value: "newest", label: "Спочатку нові" },
  { value: "oldest", label: "Спочатку старі" },
];

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
  mode = "full",
  previewLimit = 3,
}) => {
  const [answerFilter, setAnswerFilter] = useState("all");
  const [questionSort, setQuestionSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loadedPagesRange, setLoadedPagesRange] = useState({ start: 1, end: 1 });
  const itemsPerPage = 10;
  const isPreview = mode === "preview";

  const visibleQuestions = useMemo(() => {
    const filteredQuestions = questions.filter((question) => {
      if (answerFilter === "answered") return question.hasAnswer;
      if (answerFilter === "unanswered") return !question.hasAnswer;
      return true;
    });

    return [...filteredQuestions].sort((firstQuestion, secondQuestion) => {
      if (questionSort === "oldest") {
        return (firstQuestion.createdAtTime || 0) - (secondQuestion.createdAtTime || 0);
      }

      return (secondQuestion.createdAtTime || 0) - (firstQuestion.createdAtTime || 0);
    });
  }, [questions, answerFilter, questionSort]);

  useEffect(() => {
    setPage(1);
    setLoadedPagesRange({ start: 1, end: 1 });
  }, [answerFilter, questionSort]);

  const totalPages = Math.ceil(visibleQuestions.length / itemsPerPage);

  const displayedQuestions = isPreview
    ? visibleQuestions.slice(0, previewLimit)
    : visibleQuestions.slice((loadedPagesRange.start - 1) * itemsPerPage, loadedPagesRange.end * itemsPerPage);
  const emptyMessage =
    answerFilter === "all" ? undefined : "Немає питань для обраного фільтра.";

  return (
    <div className="questions-panel">
      {questionSuccess ? (
        <div className="review-success-banner">
          <CheckCircle className="success-icon" />
          <div className="banner-text">
            <strong>Дякуємо за ваше запитання.</strong>
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
                className="feedback-action-button"
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

      <div className="questions-list-toolbar">
        <div className="questions-answer-filters" aria-label="Фільтр питань">
          {QUESTION_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`question-filter-chip ${answerFilter === filter.key ? "active" : ""}`}
              onClick={() => setAnswerFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <CustomSelect
          id="question-sort"
          className="feedback-sort-select"
          value={questionSort}
          onChange={setQuestionSort}
          options={QUESTION_SORT_OPTIONS}
        />
      </div>

      <QuestionsList
        questions={displayedQuestions}
        isLoading={isLoadingQuestions}
        emptyMessage={emptyMessage}
      />

      {!isPreview && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={visibleQuestions.length}
          limit={itemsPerPage}
          itemLabel="запитань"
          onPageChange={(p) => {
            setPage(p);
            setLoadedPagesRange({ start: p, end: p });
          }}
          onLoadMore={() => {
            setLoadedPagesRange((prev) => ({ ...prev, end: prev.end + 1 }));
            setPage((prev) => prev + 1);
          }}
          hasMore={loadedPagesRange.end < totalPages}
          simpleMode={true}
          className="questions-list-pagination"
        />
      )}
    </div>
  );
};

export default QuestionsPanel;
