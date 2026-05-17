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
  RateReview,
  Close,
  InfoOutlined,
} from "@mui/icons-material";
import { Rating, TextField, FormControl, FormHelperText, Tooltip } from "@mui/material";
import ProductCard from "../../components/catalog/ProductCard/ProductCard.jsx";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import ProductPageSkeleton from "./ProductPageSkeleton.jsx";
import { useCompare } from "../../hooks/useCompare.js";
import { getCategoryDisplay } from "../../utils/categories.js";
import WishlistPickerModal from "../../components/common/WishlistPickerModal/WishlistPickerModal.jsx";
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
  const {
    isAuthenticated,
    user,
    isWishlisted,
  } = useAuth();
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    stars: 0,
    text: "",
    pros: "",
    cons: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [ratingFilter, setRatingFilter] = useState(null);

  useEffect(() => {
    if (user?.name) {
      setNewReview((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const { avgRating, stats } = useMemo(() => {
    if (!reviews.length) return { avgRating: "—", stats: {} };

    const sum = reviews.reduce((s, r) => s + r.stars, 0);
    const avg = (sum / reviews.length).toFixed(1);

    const counts = [5, 4, 3, 2, 1].reduce((acc, star) => {
      const count = reviews.filter((r) => r.stars === star).length;
      acc[star] = {
        count,
        percent: Math.round((count / reviews.length) * 100),
      };
      return acc;
    }, {});

    return { avgRating: avg, stats: counts };
  }, [reviews]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const errors = {};
    if (!newReview.stars) errors.stars = "Необхідно виставити оцінку.";
    if (!newReview.name.trim()) errors.name = "Поле обов'язкове для заповнення";
    if (!newReview.text.trim()) {
      errors.text = "Поле обов'язкове для заповнення";
    } else if (newReview.text.trim().length < 10) {
      errors.text = "Введіть не менш ніж 10 символів";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }


    const review = {
      id: Date.now(),
      name: newReview.name,
      date: new Date().toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      stars: newReview.stars,
      text: newReview.text,
      pros: newReview.pros,
      cons: newReview.cons,
      model: "",
      verified: isAuthenticated,
    };

    setReviews((prev) => [review, ...prev]);
    setFormErrors({});
    setNewReview({
      name: user?.name || "",
      stars: 0,
      text: "",
      pros: "",
      cons: "",
    });
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

  const handleOpenWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Увійдіть, щоб додати товар до списку бажань");
      return;
    }

    setIsWishlistModalOpen(true);
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
                onClick={() =>
                  document
                    .querySelector(".reviews-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <div className="stars">
                  <Rating
                    value={Number(avgRating) || 0}
                    precision={0.5}
                    readOnly
                    emptyIcon={<Star fontSize="inherit" />}
                    sx={{
                      fontSize: "1.15rem",
                      color: "#fbbf24",
                      "& .MuiRating-iconEmpty": { color: "#475569" },
                      "& .MuiSvgIcon-root": { fontSize: "inherit" },
                    }}
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
                className={`product-wishlist-button${isWishlisted(product._id || product.id) ? " active" : ""}`}
                onClick={handleOpenWishlist}
                title={
                  isWishlisted(product._id || product.id)
                    ? "Додати в інший список"
                    : "Додати до списку бажань"
                }
              >
                {isWishlisted(product._id || product.id) ? (
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

      <WishlistPickerModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        product={product}
      />

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
                    sx={{
                      fontSize: "1.8rem",
                      color: "#fbbf24",
                      "& .MuiRating-iconEmpty": { color: "#475569" },
                      "& .MuiSvgIcon-root": { fontSize: "inherit" },
                    }}
                  />
                </div>                <div className="total-reviews">
                  На основі {reviews.length} відгуків
                </div>
              </div>
            </div>

            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="rating-bar-row">
                  <span className="star-num">{star}★</span>
                  <div className="bar-bg">
                    <div
                      className="bar-fill"
                      style={{ width: (stats[star]?.percent || 0) + "%" }}
                    />
                  </div>
                  <span className="bar-percent">
                    {stats[star]?.percent || 0}%
                  </span>
                </div>
              ))}
            </div>

            <button
              className="btn-write-review"
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Скасувати" : "Написати відгук"}
            </button>
          </div>

          {/* Правая зона */}
          <div className="reviews-content-side">
            {/* Форма (показывается по кнопке) */}
            {showForm && (
              <form className="review-form" onSubmit={handleSubmitReview}>
                <button
                  type="button"
                  className="close-form"
                  onClick={() => setShowForm(false)}
                >
                  <Close />
                </button>

                <div className="review-form-header">
                  <h3>Залиште свій відгук про цей товар</h3>
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
                  <div className="form-field rating-field">
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

                  <div className="form-group">
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

                  <div className="form-group">
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
                        
                        // Жива валідація: показуємо помилку відразу при введенні
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



                <button type="submit" className="btn-primary btn-with-icon">
                  Надіслати відгук
                </button>
              </form>
            )}

            <div className="reviews-list-header">
              <div className="rating-filters">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    className={`filter-chip ${ratingFilter === star ? "active" : ""}`}
                    onClick={() =>
                      setRatingFilter(ratingFilter === star ? null : star)
                    }
                  >
                    <Star sx={{ fontSize: "14px", mr: "2px" }} /> {star}
                  </button>
                ))}
              </div>

            </div>

            {/* Список отзывов */}
            <div className="reviews-list">
              {reviews
                .filter((r) => (ratingFilter ? r.stars === ratingFilter : true))
                .map((review) => (
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
                      sx={{
                        fontSize: "1rem",
                        color: "#fbbf24",
                        "& .MuiRating-iconEmpty": { color: "#475569" },
                        "& .MuiSvgIcon-root": { fontSize: "inherit" },
                      }}
                    />
                  </div>

                  <p className="review-text">{review.text}</p>

                  {review.pros && (
                    <div className="review-pros">
                      <span className="pros-label">Переваги: </span>
                      {review.pros}
                    </div>
                  )}
                  {review.cons && (
                    <div className="review-cons">
                      <span className="cons-label">Недоліки: </span>
                      {review.cons}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {reviews.length > 0 && (
              <button className="btn-all-reviews">
                Всі відгуки ({reviews.length})
              </button>
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
