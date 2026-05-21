import { useState } from "react";
import { HelpOutline, RateReviewOutlined } from "@mui/icons-material";
import ReviewsPanel from "./ReviewsPanel.jsx";
import QuestionsPanel from "./QuestionsPanel.jsx";
import { useQuestions } from "./useQuestions.js";
import "./ProductFeedbackSection.scss";

const ProductFeedbackSection = ({
  productId,
  user,
  isAuthenticated,
  reviewState,
}) => {
  const [activeTab, setActiveTab] = useState("reviews");
  const questionState = useQuestions(productId, user, isAuthenticated);

  const tabs = [
    {
      key: "reviews",
      label: "Відгуки",
      count: reviewState.reviews.length,
      icon: RateReviewOutlined,
    },
    {
      key: "questions",
      label: "Питання",
      count: questionState.questions.length,
      icon: HelpOutline,
    },
  ];

  return (
    <section id="reviews" className="reviews-section bottom-layout product-feedback-section">
      <div className="feedback-heading-row">
        <h2 className="section-title">Відгуки та питання</h2>
      </div>

      <div className="feedback-tabs" aria-label="Відгуки та питання товару">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`feedback-tab ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
            aria-pressed={activeTab === key}
          >
            <Icon className="feedback-tab-icon" />
            <span>{label}</span>
            <strong>({count})</strong>
          </button>
        ))}
      </div>

      {activeTab === "reviews" ? (
        <ReviewsPanel {...reviewState} />
      ) : (
        <QuestionsPanel {...questionState} />
      )}
    </section>
  );
};

export default ProductFeedbackSection;
