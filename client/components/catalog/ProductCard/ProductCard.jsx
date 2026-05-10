import { Link } from "react-router-dom";
import { useCart } from "../../../hooks/useCart.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { toast } from "sonner";
import {
  ShoppingCartOutlined,
  Favorite,
  FavoriteBorder,
  Balance,
} from "@mui/icons-material";
import { useCompare } from "../../../hooks/useCompare.js";
import "./ProductCard.scss";

// Картка товару: відображає основну інфо та кнопки дій
const ProductCard = ({ product, onFavoriteChange }) => {
  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } =
    useAuth();

  // Швидке додавання в кошик
  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch({ type: "ADD_ITEM", payload: product });
    toast.success(`${product.name} додано в кошик!`);
  };

  // Обробляємо картинку: якщо немає — null
  const imgSrc = product.image || product.imageUrl || null;

  // Уніфікація ID: MongoDB використовує _id, але API може повернути id
  const productId = product._id || product.id;

  // Додавання/видалення з улюблених (тільки для авторизованих)
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
      // Викликати callback для оновлення батькіської компоненти
      if (onFavoriteChange) {
        onFavoriteChange(productId, false);
      }
    } else {
      await addToFavorites(productId);
      toast.success("Додано в улюблені");
      // Викликати callback для оновлення батькіської компоненти
      if (onFavoriteChange) {
        onFavoriteChange(productId, true);
      }
    }
  };

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
      <div className="product-card-image">
        <Link to={`/product/${productId}`}>
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">Немає зображення</div>
          )}
        </Link>

        {/* Сердечко улюблені*/}
        <button
          className={`favorite-button${isFavorite(productId) ? ' active' : ''}`}
          onClick={handleToggleFavorite}
          title={
            isFavorite(productId) ? "Видалити з улюблених" : "Додати в улюблені"
          }
          aria-pressed={isFavorite(productId)}
        >
          {isFavorite(productId) ? (
            <Favorite sx={{ fontSize: "24px" }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: "24px" }} />
          )}
        </button>

        {/* Ваги порівняння: outline коли не додано, заповнена коли додано */}
        <button
          className={`compare-button${isCompared(productId) ? ' active' : ''}`}
          onClick={handleToggleCompare}
          title={isCompared(productId) ? "Видалити з порівняння" : "Додати до порівняння"}
          aria-pressed={isCompared(productId)}
        >
          <Balance sx={{ fontSize: "24px" }} />
        </button>
      </div>

      <div className="card-content">
        <Link
          to={`/product/${productId}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <h3>{product.name}</h3>
        </Link>
        <p className="card-description">{product.description}</p>
        <p className="card-price">{product.price} грн</p>

        <div className="card-footer">
          <button className="btn-secondary" onClick={handleAddToCart}>
            <ShoppingCartOutlined sx={{ fontSize: "18px" }} />В кошик
          </button>
          <Link
            to={`/product/${productId}`}
            className="btn-primary "
            style={{ textAlign: "center" }}
          >
            Детальніше
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
