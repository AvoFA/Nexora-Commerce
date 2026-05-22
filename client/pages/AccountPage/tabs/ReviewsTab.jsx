import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  RateReviewOutlined, 
  Star, 
  ArrowForward, 
  CheckCircle, 
  Pending, 
  Cancel,
  SubdirectoryArrowRight,
  VerifiedOutlined,
  QuestionAnswerOutlined 
} from "@mui/icons-material";
import { getUserReviews } from "../../../services/reviewService.js";
import { getUserQuestions } from "../../../services/questionService.js";
import { useAuth } from "../../../context/AuthContext.jsx";

const ReviewsTab = () => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("reviews"); // "reviews" or "questions"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      const [reviewsData, questionsData] = await Promise.all([
        getUserReviews(token),
        getUserQuestions(token)
      ]);
      
      setReviews(reviewsData || []);
      setQuestions(questionsData || []);
    } catch (err) {
      setError(err.message || "Помилка завантаження даних");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const renderRatingStars = (rating) => {
    return (
      <div className="review-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{
              color: star <= rating ? "#fbbf24" : "rgba(255, 255, 255, 0.1)",
              fontSize: "18px"
            }}
          />
        ))}
      </div>
    );
  };

  const renderStatusBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="review-status-badge approved">
          <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />
          Опубліковано
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="review-status-badge rejected">
          <Cancel sx={{ fontSize: 16, mr: 0.5 }} />
          Відхилено
        </span>
      );
    }
    return (
      <span className="review-status-badge pending">
        <Pending sx={{ fontSize: 16, mr: 0.5 }} />
        На модерації
      </span>
    );
  };

  const renderReviewsList = () => {
    if (reviews.length === 0) {
      return (
        <div className="reviews-board-empty">
          <RateReviewOutlined />
          <h2>Немає відгуків</h2>
          <p>Ви ще не залишили жодного відгуку. Ваші відгуки допомагають іншим покупцям зробити правильний вибий.</p>
          <Link to="/catalog" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none", borderRadius: "8px" }}>
            Перейти до каталогу
          </Link>
        </div>
      );
    }

    return (
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-card-item">
            {/* Column 1: Rating & Date */}
            <div className="review-side-meta">
              {renderRatingStars(review.rating)}
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
            
            {/* Column 2: Main Info (Product, Text, Actions) */}
            <div className="review-main-body">
              <div className="review-product-preview">
                <div className="review-product-img">
                  {review.product?.image ? (
                    <img src={review.product.image} alt={review.product.name} />
                  ) : review.product?.images?.[0] ? (
                    <img src={review.product.images[0]} alt={review.product.name} />
                  ) : (
                    <RateReviewOutlined sx={{ fontSize: 32, opacity: 0.3 }} />
                  )}
                </div>
                <Link to={`/product/${review.product?._id}`} className="review-product-title">
                  {review.product?.name || "Товар не знайдено"}
                </Link>
              </div>

              <div className="review-text-content">
                <p>{review.text}</p>
                
                {(review.pros || review.cons) && (
                  <div className="review-pros-cons">
                    {review.pros && (
                      <div className="review-pro-item">
                        <span className="label">Переваги:</span>
                        <span>{review.pros}</span>
                      </div>
                    )}
                    {review.cons && (
                      <div className="review-con-item">
                        <span className="label">Недоліки:</span>
                        <span>{review.cons}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="review-actions">
                <Link to={`/product/${review.product?._id}`} className="btn-product-link">
                  Перейти до товару <ArrowForward />
                </Link>
              </div>
            </div>

            {/* Column 3: Status */}
            <div className="review-status-column">
              {renderStatusBadge(review.status)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuestionsList = () => {
    if (questions.length === 0) {
      return (
        <div className="reviews-board-empty">
          <QuestionAnswerOutlined />
          <h2>Немає питань</h2>
          <p>Ви ще не поставили жодного питання про товари. Наші менеджери та інші покупці будуть раді допомогти вам!</p>
          <Link to="/catalog" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none", borderRadius: "8px" }}>
            Перейти до каталогу
          </Link>
        </div>
      );
    }

    return (
      <div className="reviews-list">
        {questions.map((question) => (
          <div key={question._id} className="review-card-item">
            {/* Column 1: Date */}
            <div className="review-side-meta">
              <span className="review-date">
                {new Date(question.createdAt).toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
            
            {/* Column 2: Main Info (Product, Question, Answer, Button) */}
            <div className="review-main-body">
              <div className="review-product-preview">
                <div className="review-product-img">
                  {question.product?.image ? (
                    <img src={question.product.image} alt={question.product.name} />
                  ) : question.product?.images?.[0] ? (
                    <img src={question.product.images[0]} alt={question.product.name} />
                  ) : (
                    <QuestionAnswerOutlined sx={{ fontSize: 32, opacity: 0.3 }} />
                  )}
                </div>
                <Link to={`/product/${question.product?._id}`} className="review-product-title">
                  {question.product?.name || "Товар не знайдено"}
                </Link>
              </div>

              <div className="review-text-content">
                <div className="question-text">
                  <span className="label">Питання:</span>
                  <p>{question.text}</p>
                </div>
                
                {question.answer && (
                  <div className="question-answer-block">
                    <div className="question-answer">
                      <SubdirectoryArrowRight className="answer-thread-icon" />
                      <div className="answer-label">
                        <VerifiedOutlined className="answer-icon" />
                        Відповідь магазину
                      </div>
                      <p>{question.answer}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="review-actions">
                <Link to={`/product/${question.product?._id}`} className="btn-product-link">
                  Перейти до товару <ArrowForward />
                </Link>
              </div>
            </div>

            {/* Column 3: Status */}
            <div className="review-status-column">
              {renderStatusBadge(question.status)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBoardContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="reviews-board-empty">
          <RateReviewOutlined />
          <h2>Увійдіть в акаунт</h2>
          <p>Щоб переглядати свої відгуки та питання, потрібно авторизуватись.</p>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="reviews-board-empty">
          <h2>Завантаження...</h2>
        </div>
      );
    }
    if (error) {
      return (
        <div className="reviews-board-empty">
          <h2>Помилка</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary" style={{ padding: "8px 16px" }}>Спробувати ще</button>
        </div>
      );
    }

    return activeTab === "reviews" ? renderReviewsList() : renderQuestionsList();
  };

  const reviewFilters = [
    { key: "reviews", label: "Відгуки", count: reviews.length },
    { key: "questions", label: "Питання", count: questions.length }
  ];

  return (
    <div className="reviews-tab">
      <div className="reviews-module">
        <div className="reviews-toolbar">
          <div className="reviews-toolbar-main">
            <div className="reviews-heading">
              <h2>Відгуки та Питання</h2>
              <p>Переглядайте історію ваших відгуків, запитань та їхні статуси.</p>
            </div>

            <div className="reviews-filter-tabs" aria-label="Перемикач відгуків та питань">
              {reviewFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`reviews-filter-tab${activeTab === filter.key ? " active" : ""}`}
                  onClick={() => setActiveTab(filter.key)}
                >
                  {filter.label} <span>({filter.count})</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="reviews-summary-pill">
            {activeTab === "reviews" ? <RateReviewOutlined /> : <QuestionAnswerOutlined />}
            <strong>{activeTab === "reviews" ? reviews.length : questions.length}</strong>
            <span>{activeTab === "reviews" ? "відгуків" : "питань"}</span>
          </div>
        </div>

        <div className="reviews-board">
          {renderBoardContent()}
        </div>
      </div>
    </div>
  );
};

export default ReviewsTab;
