import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle, ChevronRight, RateReview, Star } from "@mui/icons-material";
import { Rating } from "@mui/material";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import ProductPurchaseCard from "../../components/product/ProductPurchaseCard/ProductPurchaseCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getCategoryDisplay } from "../../utils/categories.js";
import ProductFeedbackSection from "./ProductFeedbackSection.jsx";
import "./ProductPage.scss";
import ProductPageSkeleton from "./ProductPageSkeleton.jsx";
import ProductSpecsTable from "./ProductSpecsTable.jsx";
import SimilarProducts from "./SimilarProducts.jsx";
import { useProductData } from "./useProductData.js";
import { useReviews } from "./useReviews.js";

const ProductPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { product, similarProducts, isLoading, error } = useProductData(id);
  const { isAuthenticated, user } = useAuth();

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

          <p className="description-short">{product.description}</p>
          <ProductPurchaseCard product={product} variant="full" />
        </div>
      </div>

      <div className="product-detailed-content">
        <div className="content-left">
          <section className="detailed-description-section">
            <h2 className="section-title">Опис товару</h2>
            <div
              className="description-content"
              dangerouslySetInnerHTML={{
                __html: product.description || "Опис відсутній",
              }}
            />
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
    </div>
  );
};

export default ProductPage;
