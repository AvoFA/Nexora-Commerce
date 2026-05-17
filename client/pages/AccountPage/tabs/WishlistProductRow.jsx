import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import { Balance, DeleteOutline, RateReview, ShoppingCart, Star } from "@mui/icons-material";
import { formatPrice } from "../../../utils/formatPrice.js";

const getProductId = (product) => product?._id || product?.id;

const getStubRating = (id) => {
  if (!id) return { rating: 4.2, count: 28 };
  const hash = String(id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = (3.5 + (hash % 15) / 10).toFixed(1);
  const count = 8 + (hash % 120);
  return { rating: parseFloat(rating), count };
};

const WishlistProductRow = ({ product, onAddToCart, onRemove, onToggleCompare, isCompared }) => {
  const productId = getProductId(product);
  const imgSrc = product.image || product.imageUrl;
  const { rating, count } = getStubRating(productId);
  const price = Number(product.price || 0);

  return (
    <article className="wishlist-product-row">
      <Link to={`/product/${productId}`} className="wishlist-product-img">
        {imgSrc ? <img src={imgSrc} alt={product.name} /> : <span>No image</span>}
      </Link>
      <div className="wishlist-product-info">
        <Link to={`/product/${productId}`}>{product.name}</Link>
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
          <strong>{formatPrice(price)}</strong>
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
          aria-label="Р’РёРґР°Р»РёС‚Рё Р·С– СЃРїРёСЃРєСѓ"
          title="Р’РёРґР°Р»РёС‚Рё Р·С– СЃРїРёСЃРєСѓ"
        >
          <DeleteOutline />
        </button>
        <button
          type="button"
          className={`wishlist-row-compare${isCompared(productId) ? " active" : ""}`}
          onClick={() => onToggleCompare(product)}
          aria-label={isCompared(productId) ? "РЈ РїРѕСЂС–РІРЅСЏРЅРЅС–" : "РџРѕСЂС–РІРЅСЏС‚Рё"}
          title={isCompared(productId) ? "РЈ РїРѕСЂС–РІРЅСЏРЅРЅС–" : "РџРѕСЂС–РІРЅСЏС‚Рё"}
        >
          <Balance />
        </button>
      </div>
    </article>
  );
};

export default WishlistProductRow;
