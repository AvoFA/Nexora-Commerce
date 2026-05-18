import { memo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Balance,
  Favorite,
  FavoriteBorder,
  ShoppingCartOutlined,
  Star,
  RateReview,
} from "@mui/icons-material";
import { useCart } from "../../../hooks/useCart.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCompare } from "../../../hooks/useCompare.js";
import WishlistPickerModal from "../../common/WishlistPickerModal/WishlistPickerModal.jsx";
import { formatPrice } from "../../../utils/formatPrice.js";
import { getProductReviews } from "../../../services/reviewService.js";
import "./ProductCard.scss";

// Premium custom shopping cart with checkmark badge icon
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
    {/* Shopping Cart Body */}
    <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    {/* Small badge/checkmark */}
    <circle className="cart-added-badge-outline" cx="18" cy="11" r="5.5" fill="currentColor" />
    <path d="M16 11l1.3 1.3 2.2-2.2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProductCard = memo(({ product, onWishlistChange }) => {
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { isAuthenticated, isWishlisted } = useAuth();

  const productId = product._id || product.id;
  const imgSrc = product.image || product.imageUrl || null;

  const isInCart = state?.items?.some(
    (item) => item.id === productId || item._id === productId
  );

  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (productId) {
      getProductReviews(productId)
        .then((data) => {
          if (!isMounted) return;
          const reviewsList = data.reviews || [];
          if (reviewsList.length > 0) {
            const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0);
            const avg = Number((sum / reviewsList.length).toFixed(1));
            setRating(avg);
            setCount(reviewsList.length);
          } else {
            setRating(0);
            setCount(0);
          }
        })
        .catch((err) => {
          console.error("Failed to load reviews for product card:", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch({ type: "ADD_ITEM", payload: { ...product, id: productId } });
    toast.success(`${product.name} додано в кошик!`);
  };

  const handleOpenWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Увійдіть, щоб додати товар до списку бажань");
      return;
    }

    setIsWishlistModalOpen(true);
  };

  const handleToggleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isCompared(productId)) {
      removeFromCompare(productId);
      toast.success("Видалено з порівняння");
    } else {
      addToCompare(product);
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
          title={isWishlisted(productId) ? "Додати в інший список" : "Додати до списку бажань"}
          aria-pressed={isWishlisted(productId)}
        >
          {isWishlisted(productId) ? (
            <Favorite sx={{ fontSize: "20px" }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: "20px" }} />
          )}
        </button>

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
          onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
