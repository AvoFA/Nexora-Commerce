import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Balance,
  ShoppingCart,
  ShoppingCartOutlined,
  VisibilityOutlined,
  LocalShippingOutlined,
  VerifiedUserOutlined,
  Star,
  CheckCircle,
  RateReview,
  Close,
  InfoOutlined,
  ChevronRight,
} from "@mui/icons-material";
import { Rating, TextField, FormControl, FormHelperText, Tooltip } from "@mui/material";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import ProductPageSkeleton from "./ProductPageSkeleton.jsx";
import { useCompare } from "../../hooks/useCompare.js";
import { getCategoryDisplay } from "../../utils/categories.js";
import { formatPrice } from "../../utils/formatPrice.js";
import WishlistPickerModal from "../../components/common/WishlistPickerModal/WishlistPickerModal.jsx";
import "./ProductPage.scss";
import { useProductData } from "./useProductData.js";
import { useReviews } from "./useReviews.js";
import ProductSpecsTable from "./ProductSpecsTable.jsx";
import SimilarProducts from "./SimilarProducts.jsx";
import ProductFeedbackSection from "./ProductFeedbackSection.jsx";

const ProductPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { product, similarProducts, isLoading, error } = useProductData(id);

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

  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const isInCart = product && state?.items?.some(
    (item) => item.id === product._id || item.id === product.id || item._id === product._id
  );
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const {
    isAuthenticated,
    user,
    isWishlisted,
  } = useAuth();
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

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
          {/* Mini Description (Stay here as requested) */}
          <p className="description-short">{product.description}</p>

          {/* Premium Slate & Glow Purchase Card */}
          <div className="product-purchase-card">
            <div className="price-row">
              <div className="price">
                {formatPrice(product.price)}
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

            {/* Блок кнопок (One single dynamic primary button!) */}
            <div className="product-actions-wrapper">
              {isInCart ? (
                <button
                  className="btn-primary btn-with-icon"
                  onClick={() => navigate("/cart", { state: { fromProduct: product._id || product.id } })}
                >
                  <ShoppingCart sx={{ fontSize: "20px" }} />
                  Перейти до кошика
                </button>
              ) : (
                <button
                  className="btn-primary btn-with-icon"
                  onClick={handleAddToCart}
                >
                  <ShoppingCartOutlined sx={{ fontSize: "20px" }} />
                  Додати в кошик
                </button>
              )}
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
          <ProductSpecsTable attributes={product.attributes} />
        </div>
      </div>

      {/* Секція відгуків на всю ширину внизу */}
      <ProductFeedbackSection
        productId={id}
        user={user}
        isAuthenticated={isAuthenticated}
        reviewState={reviewState}
      />

      {/* Схожі товари */}
      <SimilarProducts similarProducts={similarProducts} />
    </div>
  );
};

export default ProductPage;
