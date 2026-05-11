import { memo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../hooks/useCart.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { toast } from "sonner";
import {
  ShoppingCartOutlined,
  Favorite,
  FavoriteBorder,
  Balance,
  Star,
} from "@mui/icons-material";
import { useCompare } from "../../../hooks/useCompare.js";
import "./ProductCard.scss";

// Smart Stub: детермінований рейтинг на основі ID продукту
const getStubRating = (id) => {
  if (!id) return { rating: 4.2, count: 28 };
  const hash = String(id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = (3.5 + (hash % 15) / 10).toFixed(1);
  const count = 8 + (hash % 120);
  return { rating: parseFloat(rating), count };
};

// Картка товару: відображає основну інфо та кнопки дій
const ProductCard = memo(({ product, onFavoriteChange }) => {
  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } =
    useAuth();

  const productId = product._id || product.id;
  const imgSrc = product.image || product.imageUrl || null;
  const { rating, count } = getStubRating(productId);

  // Швидке додавання в кошик
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "ADD_ITEM", payload: product });
    toast.success(`${product.name} додано в кошик!`);
  };

  // Улюблені
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Увійдіть щоб додати в улюблені");
      return;
    }

    const favorite = isFavorite(productId);
    if (favorite) {
      await removeFromFavorites(productId);
      toast.success("Видалено з улюблених");
      if (onFavoriteChange) onFavoriteChange(productId, false);
    } else {
      await addToFavorites(productId);
      toast.success("Додано в улюблені");
      if (onFavoriteChange) onFavoriteChange(productId, true);
    }
  };

  // Порівняння
  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared(productId)) {
      removeFromCompare(productId);
      toast.success("Видалено з порівняння");
    } else {
      addToCompare(product);
    }
  };

  return (
    <div className="product-card-link">
      {/* Зображення + кнопки-іконки */}
      <div className="product-card-image">
        <Link to={`/product/${productId}`} tabIndex={-1}>
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-image-placeholder">Немає зображення</div>
          )}
        </Link>

        {/* Улюблені */}
        <button
          className={`action-btn favorite-button${isFavorite(productId) ? " active" : ""}`}
          onClick={handleToggleFavorite}
          title={isFavorite(productId) ? "Видалити з улюблених" : "Додати в улюблені"}
          aria-pressed={isFavorite(productId)}
        >
          {isFavorite(productId) ? (
            <Favorite sx={{ fontSize: "20px" }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: "20px" }} />
          )}
        </button>

        {/* Порівняння */}
        <button
          className={`action-btn compare-button${isCompared(productId) ? " active" : ""}`}
          onClick={handleToggleCompare}
          title={isCompared(productId) ? "Видалити з порівняння" : "Додати до порівняння"}
          aria-pressed={isCompared(productId)}
        >
          <Balance sx={{ fontSize: "20px" }} />
        </button>
      </div>

      {/* Контент */}
      <div className="card-content">
        <Link to={`/product/${productId}`} className="card-name-link">
          <h3 className="card-name">{product.name}</h3>
        </Link>

        {/* Рейтинг (Smart Stub) */}
        <div className="card-rating">
          <Star className="rating-star" />
          <span className="rating-value">{rating}</span>
          <span className="rating-count">({count})</span>
        </div>

        {/* Ціна + кнопка кошика */}
        <div className="card-footer">
          <div className="price-block">
            <span className="card-price">
              {product.price.toLocaleString("uk-UA")} ₴
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
    </div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
