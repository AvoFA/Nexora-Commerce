import { useState } from "react";
import { SubdirectoryArrowRight, VerifiedOutlined } from "@mui/icons-material";

const QuestionsList = ({ questions, isLoading, emptyMessage }) => {
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const isAnswerExpanded = (questionId) => expandedAnswers[questionId] ?? true;
  const toggleAnswer = (questionId) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [questionId]: !(prev[questionId] ?? true),
    }));
  };

  if (isLoading) {
    return (
      <div className="questions-empty-state">
        Завантажуємо питання...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="questions-empty-state">
        {emptyMessage || "Поки немає опублікованих питань про цей товар."}
      </div>
    );
  }

  return (
    <div className="questions-list">
      {questions.map((question) => (
        <article key={question.id} className="question-item">
          <aside className="question-side-meta">{question.date}</aside>

          <div className="question-main-content">
            <strong className="question-author">{question.name}</strong>
            <p className="question-text">{question.text}</p>

            {question.answer && (
              <div className="question-answer-block">
                <button
                  type="button"
                  className="question-answer-toggle"
                  onClick={() => toggleAnswer(question.id)}
                >
                  {isAnswerExpanded(question.id)
                    ? "Сховати відповідь"
                    : "Показати відповідь (1)"}
                </button>

                {isAnswerExpanded(question.id) && (
                  <div className="question-answer">
                    <SubdirectoryArrowRight className="answer-thread-icon" />
                    <div className="answer-label">
                      <VerifiedOutlined className="answer-icon" />
                      Відповідь ElectroLux
                    </div>
                    <p>{question.answer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default QuestionsList;
