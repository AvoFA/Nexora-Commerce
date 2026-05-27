import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowBack, ShoppingCart, ShoppingCartOutlined } from "@mui/icons-material";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import ProductPurchaseCard from "../../components/product/ProductPurchaseCard/ProductPurchaseCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getCategoryDisplay } from "../../utils/categories.js";
import { formatPrice } from "../../utils/formatPrice.js";
import ProductFeedbackSection from "../ProductPage/ProductFeedbackSection.jsx";
import ProductPageSkeleton from "../ProductPage/ProductPageSkeleton.jsx";
import { useProductData } from "../ProductPage/useProductData.js";
import { useReviews } from "../ProductPage/useReviews.js";
import { useProductActions } from "../../components/product/hooks/useProductActions.js";
import "./ProductFeedbackPage.scss";

const normalizeTab = (tab) => (tab === "questions" ? "questions" : "reviews");

const ProductFeedbackPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { product, isLoading, error } = useProductData(id);
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

  const activeTab = normalizeTab(searchParams.get("tab"));
  const actions = useProductActions(product);

  const [showStickyBar, setShowStickyBar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (window.innerWidth > 768) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If scrolling down show the bar, if scrolling up hide it
      if (currentScrollY > lastScrollY.current) {
        setShowStickyBar(true);
      } else if (currentScrollY < lastScrollY.current) {
        // Add a small threshold to prevent flickering from micro-scrolls
        if (lastScrollY.current - currentScrollY > 5) {
          setShowStickyBar(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const reviewState = useMemo(
    () => ({
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
    }),
    [
      reviews,
      showForm,
      newReview,
      formErrors,
      ratingFilter,
      avgRating,
      stats,
      handleSubmitReview,
      userReview,
      isEditing,
      showSuccess,
      setShowForm,
      setNewReview,
      setFormErrors,
      setRatingFilter,
      setIsEditing,
      setShowSuccess,
    ]
  );

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
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
    <>
      <div className="product-feedback-page">
        <div className="product-feedback-page__layout">
          <main className="product-feedback-page__main">
            <Breadcrumbs items={breadcrumbItems} />

            <Link to={`/product/${id}`} className="product-feedback-page__back">
              <ArrowBack sx={{ fontSize: "18px" }} />
              <span>Все про {product.name}</span>
            </Link>

            <ProductFeedbackSection
              productId={id}
              user={user}
              isAuthenticated={isAuthenticated}
              reviewState={reviewState}
              mode="full"
              initialTab={activeTab}
              productName={product.name}
              onTabChange={handleTabChange}
            />
          </main>

          <aside className="product-feedback-page__sidebar" aria-label="Коротка інформація про товар">
            <ProductPurchaseCard product={product} variant="compact" />
          </aside>
        </div>
      </div>

      <div className={`mobile-sticky-purchase-bar ${showStickyBar ? "is-visible" : ""}`}>
        <div className="sticky-info">
          {imgSrc && <img src={imgSrc} alt="" className="sticky-thumb" />}
          <div className="sticky-meta">
            <span className="sticky-name">{product.name}</span>
            <span className="sticky-price">{formatPrice(product.price)}</span>
          </div>
        </div>
        {actions.isInCart ? (
          <button
            className="btn-primary"
            onClick={actions.handleGoToCart}
          >
            <ShoppingCart sx={{ fontSize: '18px' }} />
            До кошику
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={actions.handleAddToCart}
          >
            <ShoppingCartOutlined sx={{ fontSize: '18px' }} />
            Купити
          </button>
        )}
      </div>
    </>
  );
};

export default ProductFeedbackPage;
