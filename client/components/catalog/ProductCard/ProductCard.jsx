import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Balance,
  Favorite,
  FavoriteBorder,
  ShoppingCartOutlined,
  Star,
} from "@mui/icons-material";
import { useCart } from "../../../hooks/useCart.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCompare } from "../../../hooks/useCompare.js";
import WishlistPickerModal from "../../common/WishlistPickerModal/WishlistPickerModal.jsx";
import "./ProductCard.scss";

const getStubRating = (id) => {
  if (!id) return { rating: 4.2, count: 28 };
  const hash = String(id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = (3.5 + (hash % 15) / 10).toFixed(1);
  const count = 8 + (hash % 120);
  return { rating: parseFloat(rating), count };
};

const ProductCard = memo(({ product, onWishlistChange }) => {
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { isAuthenticated, isWishlisted } = useAuth();

  const productId = product._id || product.id;
  const imgSrc = product.image || product.imageUrl || null;
  const { rating, count } = getStubRating(productId);

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

        <div className="card-rating">
          <Star className="rating-star" />
          <span className="rating-value">{rating}</span>
          <span className="rating-count">({count})</span>
        </div>

        <div className="card-footer">
          <div className="price-block">
            <span className="card-price">
              {Number(product.price || 0).toLocaleString("uk-UA")} ₴
            </span>
          </div>

          <div className="footer-actions">
            <button
              className="btn-cart-round"
              onClick={handleAddToCart}
              aria-label="Додати до кошика"
              title="Додати до кошика"
            >
              <ShoppingCartOutlined sx={{ fontSize: "20px" }} />
            </button>
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
