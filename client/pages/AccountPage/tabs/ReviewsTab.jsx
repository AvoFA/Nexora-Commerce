import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RateReviewOutlined, Star, ArrowForward, CheckCircle, Pending, Cancel } from "@mui/icons-material";
import { getUserReviews } from "../../../services/reviewService.js";
import { useAuth } from "../../../context/AuthContext.jsx";

const ReviewsTab = () => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const data = await getUserReviews(token);
      setReviews(data || []);
    } catch (err) {
      setError(err.message || "Помилка завантаження відгуків");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchReviews();
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

  const renderBoardContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="reviews-board-empty">
          <RateReviewOutlined />
          <h2>Увійдіть в акаунт</h2>
          <p>Щоб переглядати свої відгуки, потрібно авторизуватись.</p>
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
          <button onClick={fetchReviews} className="btn-primary" style={{ padding: "8px 16px" }}>Спробувати ще</button>
        </div>
      );
    }
    if (reviews.length === 0) {
      return (
        <div className="reviews-board-empty">
          <RateReviewOutlined />
          <h2>Немає відгуків</h2>
          <p>Ви ще не залишили жодного відгуку. Ваші відгуки допомагають іншим покупцям зробити правильний вибір.</p>
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
            <div className="review-product-img">
              {review.product?.image ? (
                <img src={review.product.image} alt={review.product.name} />
              ) : review.product?.images?.[0] ? (
                <img src={review.product.images[0]} alt={review.product.name} />
              ) : (
                <RateReviewOutlined sx={{ fontSize: 40, opacity: 0.3 }} />
              )}
            </div>
            
            <div className="review-card-content">
              <div className="review-card-header">
                <div>
                  <Link to={`/product/${review.product?._id}`} className="review-product-title">
                    {review.product?.name || "Товар не знайдено"}
                  </Link>
                  {renderRatingStars(review.rating)}
                </div>
                
                <div className="review-meta">
                  {renderStatusBadge(review.status)}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
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
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-tab">
      <div className="reviews-module">
        <div className="reviews-toolbar">
          <div className="reviews-heading">
            <h2>Мої відгуки</h2>
            <p>Переглядайте історію ваших відгуків та їхні статуси.</p>
          </div>
          
          <div className="reviews-summary-pill">
            <RateReviewOutlined />
            <strong>{reviews.length}</strong>
            <span>відгуків</span>
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
