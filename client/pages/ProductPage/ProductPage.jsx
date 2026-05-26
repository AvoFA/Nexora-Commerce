import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle, ChevronRight, RateReview, Star, ShoppingCart, ExpandMore, ExpandLess } from "@mui/icons-material";
import { Rating } from "@mui/material";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import ProductPurchaseCard from "../../components/product/ProductPurchaseCard/ProductPurchaseCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getCategoryDisplay } from "../../utils/categories.js";
import { addRecentlyViewed } from "../../utils/recentlyViewed.utils.js";
import { formatPrice } from "../../utils/formatPrice.js";
import ProductFeedbackSection from "./ProductFeedbackSection.jsx";
import "./ProductPage.scss";
import ProductPageSkeleton from "./ProductPageSkeleton.jsx";
import ProductSpecsTable from "./ProductSpecsTable.jsx";
import SimilarProducts from "./SimilarProducts.jsx";
import { useProductData } from "./useProductData.js";
import { useReviews } from "./useReviews.js";
import { parseMarkdown } from "../../utils/markdown.js";

const ProductPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { product, similarProducts, isLoading, error } = useProductData(id);
  const { isAuthenticated, user } = useAuth();

  // Рефи та стейт для липкої панелі (Senior approach)
  const mainPurchaseRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [hasLongDesc, setHasLongDesc] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    if (!product || !descRef.current) return;

    const checkHeight = () => {
      if (descRef.current) {
        setHasLongDesc(descRef.current.scrollHeight > 280);
      }
    };

    checkHeight();
    const timer = setTimeout(checkHeight, 500);
    return () => clearTimeout(timer);
  }, [product, isLoading]);

  useEffect(() => {
    if (product && !isLoading) {
      addRecentlyViewed(product);
    }
  }, [product, isLoading]);

  // Логіка спостереження за кнопкою покупки
  useEffect(() => {
    if (isLoading || !product) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Показуємо липку панель, лише якщо основна кнопка пішла вгору за межі екрана
        if (window.innerWidth <= 768) {
          setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        } else {
          setShowStickyBar(false);
        }
      },
      { threshold: 0 }
    );

    if (mainPurchaseRef.current) {
      observer.observe(mainPurchaseRef.current);
    }

    return () => observer.disconnect();
  }, [product, isLoading]);

  const {
    reviews,
    showForm,
    setShowForm,
    newReview,
    setNewReview,
    formErrors,
    setFormErrors,
    ratingFilter,
    setRatingFilter,
    avgRating,
    stats,
    handleSubmitReview,
    userReview,
    isEditing,
    setIsEditing,
    showSuccess,
    setShowSuccess,
  } = useReviews(id, user, isAuthenticated);

  useEffect(() => {
    if (location.hash === "#reviews" && !isLoading && product) {
      const timer = setTimeout(() => {
        document
          .querySelector(".reviews-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.hash, isLoading, product]);

  if (isLoading) return <ProductPageSkeleton />;
  if (error) return <div>Помилка: {error}</div>;
  if (!product) return <div>Товар не знайдено.</div>;

  const imgSrc = product.image || product.imageUrl || null;
  const reviewState = {
    reviews,
    showForm,
    setShowForm,
    newReview,
    setNewReview,
    formErrors,
    setFormErrors,
    ratingFilter,
    setRatingFilter,
    avgRating,
    stats,
    handleSubmitReview,
    userReview,
    isEditing,
    setIsEditing,
    showSuccess,
    setShowSuccess,
  };

  const breadcrumbItems = [
    { label: "Каталог", path: "/catalog" },
    {
      label: getCategoryDisplay(product.category),
      path: `/catalog?category=${product.category}`,
    },
    {
      label: product.brand,
      path: `/catalog?brand=${encodeURIComponent(product.brand)}`,
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
            </div>

            <div className="product-status-row">
              <span className="stock-badge in-stock">
                <CheckCircle sx={{ fontSize: "16px" }} />В наявності
              </span>

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

            <Link
              to={`/catalog?brand=${encodeURIComponent(product.brand)}`}
              className="product-brand-card"
            >
              <div className="brand-card-left">
                <span className="brand-name">{product.brand}</span>
                <span className="brand-subtitle">Всі товари бренду</span>
              </div>
              <ChevronRight className="brand-chevron" />
            </Link>
          </div>

          {/* Обгортка для IntersectionObserver */}
          <div ref={mainPurchaseRef}>
            <ProductPurchaseCard product={product} variant="full" />
          </div>

          <div className="product-highlights">
            <div className="trust-block">
              <div className="trust-item">
                <span className="trust-icon">🚚</span>
                <div className="trust-text">
                  <strong>Доставка</strong>
                  <span>Нова Пошта, Самовивіз</span>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🛡️</span>
                <div className="trust-text">
                  <strong>Гарантія</strong>
                  <span>12 місяців від виробника</span>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔄</span>
                <div className="trust-text">
                  <strong>Повернення</strong>
                  <span>Протягом 14 днів</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="product-detailed-content">
        <div className="content-left">
          <section className="detailed-description-section">
            <h2 className="section-title">Опис товару</h2>
            <div className={`description-outer-container ${!isDescExpanded && hasLongDesc ? "is-collapsed" : ""}`}>
              <div
                ref={descRef}
                className="description-content"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(product.description) || "Опис відсутній",
                }}
              />
            </div>
            {hasLongDesc && (
              <div className="desc-toggle-container">
                <button
                  type="button"
                  className="desc-toggle-btn"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                >
                  {isDescExpanded ? (
                    <>
                      <span>Згорнути опис</span>
                      <ExpandLess sx={{ fontSize: "18px" }} />
                    </>
                  ) : (
                    <>
                      <span>Показати більше</span>
                      <ExpandMore sx={{ fontSize: "18px" }} />
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          <ProductSpecsTable attributes={product.attributes} />
        </div>
      </div>

      <ProductFeedbackSection
        productId={id}
        user={user}
        isAuthenticated={isAuthenticated}
        reviewState={reviewState}
        mode="preview"
        feedbackUrl={`/product/${id}/feedback`}
      />

      <SimilarProducts similarProducts={similarProducts} />

      {/* Мобільна липка панель (Senior UI) */}
      <div className={`mobile-sticky-purchase-bar ${showStickyBar ? 'is-visible' : ''}`}>
        <div className="sticky-info">
          <span className="sticky-name">{product.name}</span>
          <span className="sticky-price">{formatPrice(product.price)}</span>
        </div>
        <button
          className="btn-primary"
          onClick={() => mainPurchaseRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ShoppingCart sx={{ fontSize: '18px' }} />
          Купити
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
