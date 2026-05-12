import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  getProductById,
  getSimilarProducts,
} from "../../services/productService.js";
import { useCart } from "../../hooks/useCart.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Balance,
  ShoppingCartOutlined,
  VisibilityOutlined,
  LocalShippingOutlined,
  VerifiedUserOutlined,
  Star,
  CheckCircle,
  RateReview
} from "@mui/icons-material";
import { Rating } from "@mui/material";
import ProductCard from "../../components/catalog/ProductCard/ProductCard.jsx";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import ProductPageSkeleton from "./ProductPageSkeleton.jsx";
import { useCompare } from "../../hooks/useCompare.js";
import "./ProductPage.scss";

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Олександр К.",
    date: "12 Травня 2024",
    stars: 5,
    text: "Чудовий вибір! Користуюся вже тиждень, все працює ідеально.",
    pros: "Камера, швидкість роботи",
    cons: "Немає",
    model: "256 ГБ / Чорний",
    verified: true,
  },
  {
    id: 2,
    name: "Марія В.",
    date: "08 Травня 2024",
    stars: 4,
    text: "Гарний дизайн та дуже швидка зарядка. Єдиний мінус — маркий корпус.",
    pros: "Дизайн, швидка зарядка",
    cons: "Маркий корпус",
    model: "128 ГБ / Білий",
    verified: true,
  },
];

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } =
    useAuth();

  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ stars: 0, text: "", pros: "", cons: "" });

  const getCategoryDisplay = (cat) => {
    const mapping = {
      phones: "Смартфони",
      laptops: "Ноутбуки",
      tablets: "Планшети",
    };
    return mapping[cat] || cat;
  };

  const { avgRating, stats } = useMemo(() => {
    if (!reviews.length) return { avgRating: "—", stats: {} };
    
    const sum = reviews.reduce((s, r) => s + r.stars, 0);
    const avg = (sum / reviews.length).toFixed(1);
    
    const counts = [5, 4, 3, 2, 1].reduce((acc, star) => {
      const count = reviews.filter(r => r.stars === star).length;
      acc[star] = {
        count,
        percent: Math.round((count / reviews.length) * 100)
      };
      return acc;
    }, {});

    return { avgRating: avg, stats: counts };
  }, [reviews]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.stars) return toast.error("Оберіть оцінку");
    if (!newReview.text.trim()) return toast.error("Напишіть відгук");

    const review = {
      id: Date.now(),
      name: isAuthenticated ? "Ви" : "Анонім",
      date: new Date().toLocaleDateString("uk-UA", {
        day: "numeric", month: "long", year: "numeric"
      }),
      stars: newReview.stars,
      text: newReview.text,
      pros: newReview.pros,
      cons: newReview.cons,
      model: "",
      verified: isAuthenticated,
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ stars: 0, text: "", pros: "", cons: "" });
    setShowForm(false);
    toast.success("Відгук додано!");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!id || !product) return;
      try {
        const similar = await getSimilarProducts(id);
        setSimilarProducts(similar);
      } catch (err) {
        setSimilarProducts([]);
      }
    };
    fetchSimilarProducts();
  }, [id, product]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch({ type: "ADD_ITEM", payload: product });
    toast.success(`${product.name} додано в кошик!`);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) return toast.error("Увійдіть щоб додати в улюблені");

    const productId = product._id || product.id;
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
      toast.success("Видалено з улюблених");
    } else {
      await addToFavorites(productId);
      toast.success("Додано в улюблені");
    }
  };

  const handleToggleCompare = () => {
    if (!product) return;
    const productId = product._id || product.id;
    if (isCompared(productId)) {
      removeFromCompare(productId);
      toast.success("Видалено з порівняння");
    } else {
      addToCompare(product);
    }
  };

  if (isLoading) return <ProductPageSkeleton />;
  if (error) return <div>Помилка: {error}</div>;
  if (!product) return <div>Товар не знайдено.</div>;

  const imgSrc = product.image || product.imageUrl || null;

  const breadcrumbItems = [
    { label: "Каталог", path: "/catalog" },
    {
      label: getCategoryDisplay(product.category),
      path: `/catalog?category=${product.category}`,
    },
    { label: product.name },
  ];

  return (
    <div className="product-page-wrapper">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="product-page-container">
        <div className="product-image-gallery">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">No image</div>
          )}
        </div>

        <div className="product-details">
          <div className="product-header">
            <div className="product-title-section">
              <h1>{product.name}</h1>
              <div
                className="product-rating-link"
                onClick={() => document.querySelector('.reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="stars">
                  <Rating 
                    value={Number(avgRating) || 0} 
                    precision={0.5} 
                    readOnly 
                    emptyIcon={<Star fontSize="inherit" />}
                    className="custom-rating"
                  />
                </div>

                <div className="review-count-badge">
                  <RateReview />
                  <span>{reviews.length}</span>
                </div>
              </div>
            </div>
            <div className="product-badges">
              <span className="badge brand-badge">{product.brand}</span>
              <span className="badge category-badge">
                {getCategoryDisplay(product.category)}
              </span>
              <span className="badge stock-badge in-stock">
                <CheckCircle sx={{ fontSize: "16px" }} />В наявності
              </span>
            </div>
          </div>
          <div className="price-row">
            <div className="price">
              {product.price.toLocaleString("uk-UA")} ₴
            </div>
            <div className="product-actions-icons">
              {/* Сердечко улюблені */}
              <button
                className={`product-favorite-button${isFavorite(product._id || product.id) ? " active" : ""}`}
                onClick={handleToggleFavorite}
                title={
                  isFavorite(product._id || product.id)
                    ? "Видалити з улюблених"
                    : "Додати в улюблені"
                }
              >
                {isFavorite(product._id || product.id) ? (
                  <Favorite sx={{ fontSize: "28px" }} />
                ) : (
                  <FavoriteBorder sx={{ fontSize: "28px" }} />
                )}
              </button>
              {/* Ваги порівняння */}
              <button
                className={`product-compare-button${isCompared(product._id || product.id) ? " active" : ""}`}
                onClick={handleToggleCompare}
                title={
                  isCompared(product._id || product.id)
                    ? "Видалити з порівняння"
                    : "Додати до порівняння"
                }
              >
                <Balance sx={{ fontSize: "28px" }} />
              </button>
            </div>
          </div>
          {/* Mini Description (Stay here as requested) */}
          <p className="description-short">{product.description}</p>

          {/* Блок кнопок */}
          <div className="product-actions-wrapper">
            <button
              className="btn-primary btn-with-icon"
              onClick={handleAddToCart}
            >
              <ShoppingCartOutlined sx={{ fontSize: "20px" }} />
              Додати в кошик
            </button>

            <Link to="/cart" className="btn-secondary">
              <VisibilityOutlined sx={{ fontSize: "20px" }} />
              Перейти до кошика
            </Link>
          </div>

          {/* Info Badges Card Grid */}
          <div className="product-info-grid">
            <div className="info-card">
              <div className="icon-box delivery">
                <LocalShippingOutlined className="info-icon" />
              </div>
              <div className="info-card-text">
                <span className="info-label">Доставка</span>
                <span className="info-value">Безкоштовно</span>
              </div>
            </div>
            <div className="info-card">
              <div className="icon-box warranty">
                <VerifiedUserOutlined className="info-icon" />
              </div>
              <div className="info-card-text">
                <span className="info-label">Гарантія</span>
                <span className="info-value">24 місяці</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* НОВА СЕКЦІЯ: Детальна інформація (Опис, Характеристики та Відгуки) */}
      <div className="product-detailed-content">
        <div className="content-left">
          {/* Розгорнутий опис */}
          <section className="detailed-description-section">
            <h2 className="section-title">Опис товару</h2>
            <div
              className="description-content"
              dangerouslySetInnerHTML={{
                __html: product.description || "Опис відсутній",
              }}
            />
          </section>

          {/* Характеристики (Єдина таблиця як у макеті) */}
          <section className="characteristics-section">
            <h2 className="section-title">Характеристики</h2>

            <div className="specs-table-box">
              {(() => {
                const groups = {
                  Екран: [
                    "Діагональ",
                    "Діагональ екрану",
                    "Роздільна здатність",
                    "Тип матриці",
                    "Частота оновлення",
                    "Яскравість",
                  ],
                  "Процесор та Пам'ять": [
                    "Процесор",
                    "Оперативна пам'ять",
                    "Вбудована пам'ять",
                    "RAM",
                    "SSD",
                    "Пам'ять",
                    "Тип пам'яті",
                    "Відеокарта",
                  ],
                  Камера: [
                    "Основна камера",
                    "Фронтальна камера",
                    "Камера",
                    "Запис відео",
                  ],
                  "Зв'язок та ОС": [
                    "SIM",
                    "Кількість SIM-карт",
                    "Операційна система",
                    "NFC",
                    "Bluetooth",
                    "Wi-Fi",
                    "Версія ОС",
                  ],
                  Корпус: [
                    "Колір",
                    "Матеріал корпусу",
                    "Вага",
                    "Габарити",
                    "Захист",
                    "Комплектація",
                  ],
                };

                const attributes = product.attributes || [];
                const usedKeys = new Set();

                // Фільтруємо групи, які мають дані
                const activeGroups = Object.entries(groups).filter(
                  ([_, keys]) =>
                    attributes.some((attr) => keys.includes(attr.key)),
                );

                return (
                  <>
                    {activeGroups.map(([groupName, keys], groupIdx) => {
                      const groupSpecs = attributes.filter((attr) =>
                        keys.includes(attr.key),
                      );
                      groupSpecs.forEach((attr) => usedKeys.add(attr.key));

                      return (
                        <div key={groupName} className="specs-table-group">
                          <div className="group-header">{groupName}</div>
                          <div className="group-rows">
                            {groupSpecs.map((spec, idx) => (
                              <div key={idx} className="spec-row-grid">
                                <div className="spec-key">{spec.key}</div>
                                <div className="spec-value">{spec.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Інші характеристики */}
                    {attributes.filter((attr) => !usedKeys.has(attr.key))
                      .length > 0 && (
                      <div className="specs-table-group">
                        <div className="group-header">Інші характеристики</div>
                        <div className="group-rows">
                          {attributes
                            .filter((attr) => !usedKeys.has(attr.key))
                            .map((spec, idx) => (
                              <div key={idx} className="spec-row-grid">
                                <div className="spec-key">{spec.key}</div>
                                <div className="spec-value">{spec.value}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </section>
        </div>

        </div>

        {/* Секція відгуків на всю ширину внизу */}
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
                      className="custom-rating big"
                    />
                  </div>
                  <div className="total-reviews">На основі {reviews.length} відгуків</div>
                </div>
              </div>

              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="rating-bar-row">
                    <span className="star-num">{star}★</span>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: (stats[star]?.percent || 0) + "%" }} />
                    </div>
                    <span className="bar-percent">{stats[star]?.percent || 0}%</span>
                  </div>
                ))}
              </div>

              <button className="btn-write-review" onClick={() => setShowForm(v => !v)}>
                {showForm ? "Скасувати" : "Написати відгук"}
              </button>
            </div>

            {/* Правая зона */}
            <div className="reviews-content-side">

              {/* Форма (показывается по кнопке) */}
              {showForm && (
                <form className="review-form" onSubmit={handleSubmitReview}>
                  <div className="form-field">
                    <label>Оцінка</label>
                    <div className="star-picker">
                      <Rating
                        name="review-stars"
                        value={newReview.stars}
                        onChange={(event, newValue) => {
                          setNewReview(p => ({ ...p, stars: newValue || 0 }));
                        }}
                        emptyIcon={<Star fontSize="inherit" />}
                        className="custom-rating interactive"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Відгук</label>
                    <textarea
                      placeholder="Розкажіть про товар..."
                      value={newReview.text}
                      onChange={e => setNewReview(p => ({ ...p, text: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Переваги</label>
                      <input
                        placeholder="Що сподобалось?"
                        value={newReview.pros}
                        onChange={e => setNewReview(p => ({ ...p, pros: e.target.value }))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Недоліки</label>
                      <input
                        placeholder="Що не сподобалось?"
                        value={newReview.cons}
                        onChange={e => setNewReview(p => ({ ...p, cons: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary btn-with-icon">
                    Надіслати відгук
                  </button>
                </form>
              )}

              {/* Список отзывов */}
              <div className="reviews-list">
                {reviews.map((review) => (
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
                        className="custom-rating small"
                      />
                    </div>

                    <p className="review-text">{review.text}</p>

                    {review.pros && (
                      <div className="review-pros">
                        <span className="pros-label">Переваги: </span>{review.pros}
                      </div>
                    )}
                    {review.cons && (
                      <div className="review-cons">
                        <span className="cons-label">Недоліки: </span>{review.cons}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {reviews.length > 0 && (
                <button className="btn-all-reviews">Всі відгуки ({reviews.length})</button>
              )}
            </div>
          </div>
        </section>

      {/* Схожі товари */}
      {similarProducts.length > 0 && (
        <div className="similar-products-section">
          <h2 className="section-title">Схожі товари</h2>
          <p className="section-subtitle">Вам також можуть сподобатися</p>
          <div className="similar-products-grid">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
