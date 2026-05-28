import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import { Balance, DeleteOutline, RateReview, ShoppingCart, Star } from "@mui/icons-material";
import { formatPrice, getProductDiscountAmount, hasProductDiscount } from "../../../utils/formatPrice.js";
import { getProductReviews } from "../../../services/reviewService.js";

const getProductId = (product) => product?._id || product?.id;

const WishlistProductRow = ({
  product,
  onAddToCart,
  onRemove,
  onToggleCompare,
  isCompared,
  onNavigate,
}) => {
  const productId = getProductId(product);
  const imgSrc = product.image || product.imageUrl;

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
          console.error("Failed to load reviews for product in wishlist:", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const price = Number(product.price || 0);
  const hasDiscount = hasProductDiscount(product);
  const discountAmount = getProductDiscountAmount(product);

  return (
    <article className="wishlist-product-row">
      <Link to={`/product/${productId}`} className="wishlist-product-img" onClick={onNavigate}>
        {imgSrc ? <img src={imgSrc} alt={product.name} /> : <span>No image</span>}
      </Link>
      <div className="wishlist-product-info">
        <Link to={`/product/${productId}`} onClick={onNavigate}>{product.name}</Link>
        <div className="wishlist-product-rating-link">
          <div className="wishlist-product-stars">
            <Rating
              value={rating}
              precision={0.5}
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
          <div className="wishlist-product-review-count">
            <RateReview />
            <span>{count}</span>
          </div>
        </div>
        <div className="wishlist-product-price-row">
          <div className="wishlist-product-price-stack">
            {hasDiscount && (
              <div className="wishlist-product-discount-row">
                <span className="wishlist-product-old-price">{formatPrice(product.compareAtPrice)}</span>
                <span className="wishlist-product-discount">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <strong>{formatPrice(price)}</strong>
          </div>
          <button
            type="button"
            className="wishlist-cart-btn"
            onClick={() => onAddToCart(product)}
            aria-label="Додати до кошика"
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
      <div className="wishlist-product-actions">
        <button
          type="button"
          className="wishlist-row-remove"
          onClick={() => onRemove(productId)}
          aria-label="Видалити зі списку"
          title="Видалити зі списку"
        >
          <DeleteOutline />
        </button>
        <button
          type="button"
          className={`wishlist-row-compare${isCompared(productId) ? " active" : ""}`}
          onClick={(event) => onToggleCompare(product, event)}
          aria-label={isCompared(productId) ? "У порівнянні" : "Порівняти"}
          title={isCompared(productId) ? "У порівнянні" : "Порівняти"}
        >
          <Balance />
        </button>
      </div>
    </article>
  );
};

export default WishlistProductRow;
