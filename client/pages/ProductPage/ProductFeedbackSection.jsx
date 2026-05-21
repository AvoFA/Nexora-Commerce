import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowForward, HelpOutline, RateReviewOutlined } from "@mui/icons-material";
import ReviewsPanel from "./ReviewsPanel.jsx";
import QuestionsPanel from "./QuestionsPanel.jsx";
import { useQuestions } from "./useQuestions.js";
import "./ProductFeedbackSection.scss";

const PREVIEW_LIMIT = 3;
const normalizeTab = (tab) => (tab === "questions" ? "questions" : "reviews");

const ProductFeedbackSection = ({
  productId,
  user,
  isAuthenticated,
  reviewState,
  mode = "full",
  initialTab = "reviews",
  feedbackUrl,
  productName,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(() => normalizeTab(initialTab));
  const questionState = useQuestions(productId, user, isAuthenticated);
  const isPreview = mode === "preview";

  useEffect(() => {
    setActiveTab(normalizeTab(initialTab));
  }, [initialTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const viewAllUrl = feedbackUrl ? `${feedbackUrl}?tab=${activeTab}` : null;

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
        <h2 className="section-title">
          Відгуки та питання
          {productName && <span className="section-title-product">{productName}</span>}
        </h2>
      </div>

      <div className="feedback-tabs" aria-label="Відгуки та питання товару">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`feedback-tab ${activeTab === key ? "active" : ""}`}
            onClick={() => handleTabChange(key)}
            aria-pressed={activeTab === key}
          >
            <Icon className="feedback-tab-icon" />
            <span>{label}</span>
            <strong>({count})</strong>
          </button>
        ))}
      </div>

      {activeTab === "reviews" ? (
        <ReviewsPanel {...reviewState} mode={mode} previewLimit={PREVIEW_LIMIT} />
      ) : (
        <QuestionsPanel {...questionState} mode={mode} previewLimit={PREVIEW_LIMIT} />
      )}

      {isPreview && viewAllUrl && (
        <div className="feedback-preview-actions">
          <Link to={viewAllUrl} className="btn-primary feedback-view-all">
            {activeTab === "questions" ? "Усі питання" : "Усі відгуки"}
            <ArrowForward className="feedback-view-all-icon" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default ProductFeedbackSection;
