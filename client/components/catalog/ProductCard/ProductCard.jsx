import { memo, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Balance,
  Favorite,
  FavoriteBorder,
  RateReview,
  ShoppingCartOutlined,
  Star,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCart } from "../../../hooks/useCart.js";
import { useCompare } from "../../../hooks/useCompare.js";
import { getProductReviews } from "../../../services/reviewService.js";
import { formatPrice } from "../../../utils/formatPrice.js";
import { openAuthModal } from "../../../utils/authModalEvents.js";
import { getAnchorRect, showCompareRemovedToast } from "../../../utils/notifications.js";
import WishlistPickerModal from "../../common/WishlistPickerModal/WishlistPickerModal.jsx";
import "./ProductCard.scss";

const CartAddedIcon = ({ style, ...props }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", ...style }}
    {...props}
  >
    <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    <circle className="cart-added-badge-outline" cx="18" cy="11" r="5.5" fill="currentColor" />
    <path d="M16 11l1.3 1.3 2.2-2.2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProductCard = memo(({ product, onWishlistChange }) => {
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isAuthTooltipVisible, setIsAuthTooltipVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const authTooltipTimerRef = useRef(null);
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { isAuthenticated, isWishlisted } = useAuth();

  const productId = product._id || product.id;
  const imgSrc = product.image || product.imageUrl || null;
  const isInCart = state?.items?.some(
    (item) => item.id === productId || item._id === productId
  );

  useEffect(() => {
    let isMounted = true;

    if (productId) {
      getProductReviews(productId)
        .then((data) => {
          if (!isMounted) return;
          const reviewsList = data.reviews || [];

          if (reviewsList.length > 0) {
            const sum = reviewsList.reduce((acc, review) => acc + (review.rating || 0), 0);
            setRating(Number((sum / reviewsList.length).toFixed(1)));
            setCount(reviewsList.length);
          } else {
            setRating(0);
            setCount(0);
          }
        })
        .catch((error) => {
          console.error("Failed to load reviews for product card:", error);
        });
    }

    return () => {
      isMounted = false;
      window.clearTimeout(authTooltipTimerRef.current);
    };
  }, [productId]);

  const showAuthTooltip = () => {
    window.clearTimeout(authTooltipTimerRef.current);
    setIsAuthTooltipVisible(true);
  };

  const hideAuthTooltip = () => {
    window.clearTimeout(authTooltipTimerRef.current);
    authTooltipTimerRef.current = window.setTimeout(() => {
      setIsAuthTooltipVisible(false);
    }, 350);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch({ type: "ADD_ITEM", payload: { ...product, id: productId } });
  };

  const handleOpenWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      // Надійна перевірка на мобільні пристрої (екрани або сенсори)
      const isMobile = window.innerWidth <= 768 || window.matchMedia("(hover: none)").matches;

      if (isMobile && !isAuthTooltipVisible) {
        showAuthTooltip();

        // Автоматично приховати підказку через 3 секунди
        window.clearTimeout(authTooltipTimerRef.current);
        authTooltipTimerRef.current = window.setTimeout(() => {
          setIsAuthTooltipVisible(false);
        }, 3000);
        return;
      }

      openAuthModal();
      return;
    }

    setIsWishlistModalOpen(true);
  };

  const handleToggleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isCompared(productId)) {
      removeFromCompare(productId);
      showCompareRemovedToast(getAnchorRect(event));
    } else {
      addToCompare(product, { anchor: getAnchorRect(event) });
    }
  };

  return (
    <div className="product-card-link">
      <div className="product-card-image">
        <Link to={`/product/${productId}`} tabIndex={-1}>
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-image-placeholder">Немає зображення</div>
          )}
        </Link>

        <button
          className={`action-btn wishlist-button${isWishlisted(productId) ? " active" : ""}`}
          onClick={handleOpenWishlist}
          onMouseEnter={!isAuthenticated ? () => { if (window.innerWidth > 768) showAuthTooltip(); } : undefined}
          onMouseLeave={!isAuthenticated ? () => { if (window.innerWidth > 768) hideAuthTooltip(); } : undefined}
          onFocus={!isAuthenticated ? () => { if (window.innerWidth > 768) showAuthTooltip(); } : undefined}
          onBlur={!isAuthenticated ? () => { if (window.innerWidth > 768) hideAuthTooltip(); } : undefined}
          title={isWishlisted(productId) ? "Додати в інший список" : "Додати до списку бажань"}
          aria-pressed={isWishlisted(productId)}
        >
          {isWishlisted(productId) ? (
            <Favorite sx={{ fontSize: "20px" }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: "20px" }} />
          )}
        </button>
        {!isAuthenticated && (
          <div
            className={`wishlist-auth-tooltip${isAuthTooltipVisible ? " visible" : ""}`}
            role="tooltip"
            onMouseEnter={showAuthTooltip}
            onMouseLeave={hideAuthTooltip}
          >
            <button
              type="button"
              onClick={handleOpenWishlist}
              className="wishlist-auth-tooltip__link"
            >
              Авторизуйтесь
            </button>
            <span>, щоб додати товар до обраного</span>
          </div>
        )}

        <button
          className={`action-btn compare-button${isCompared(productId) ? " active" : ""}`}
          onClick={handleToggleCompare}
          title={isCompared(productId) ? "Видалити з порівняння" : "Додати до порівняння"}
          aria-pressed={isCompared(productId)}
        >
          <Balance sx={{ fontSize: "20px" }} />
        </button>
      </div>

      <div className="card-content">
        <Link to={`/product/${productId}`} className="card-name-link">
          <h3 className="card-name" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <Link
          to={`/product/${productId}#reviews`}
          className="card-rating"
          onClick={(event) => event.stopPropagation()}
        >
          <Star className="rating-star" />
          <span className="rating-value">{rating}</span>
          <div className="rating-reviews">
            <RateReview className="review-icon" />
            <span className="rating-count">{count}</span>
          </div>
        </Link>

        <div className="card-footer">
          <div className="price-block">
            <span className="card-price">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="footer-actions">
            {isInCart ? (
              <button
                className="btn-cart-round added"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  navigate("/cart", { state: { fromProduct: productId } });
                }}
                aria-label="Перейти до кошика"
                title="Перейти до кошика"
              >
                <CartAddedIcon />
              </button>
            ) : (
              <button
                className="btn-cart-round"
                onClick={handleAddToCart}
                aria-label="Додати до кошика"
                title="Додати до кошика"
              >
                <ShoppingCartOutlined sx={{ fontSize: "20px" }} />
              </button>
            )}
          </div>
        </div>
      </div>

      <WishlistPickerModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        product={product}
        onWishlistChange={(data) => onWishlistChange?.(productId, data)}
      />
    </div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
