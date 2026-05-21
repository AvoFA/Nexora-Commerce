import {
  Balance,
  CheckCircle,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { formatPrice } from "../../../utils/formatPrice.js";
import WishlistPickerModal from "../../common/WishlistPickerModal/WishlistPickerModal.jsx";
import { useProductActions } from "../hooks/useProductActions.js";
import "./ProductPurchaseCard.scss";

const getProductImage = (product) => product?.image || product?.imageUrl || null;

const ProductPurchaseCard = ({ product, variant = "full" }) => {
  const actions = useProductActions(product);
  const isCompact = variant === "compact";
  const imgSrc = getProductImage(product);

  if (!product) return null;

  return (
    <>
      <div className={`product-purchase-card product-purchase-card--${variant}`}>
        {isCompact && (
          <div className="product-purchase-card__summary">
            <div className="product-purchase-card__image">
              {imgSrc ? (
                <img src={imgSrc} alt={product.name} />
              ) : (
                <div className="product-image-placeholder">No image</div>
              )}
            </div>
            <div className="product-purchase-card__meta">
              <h2 className="product-purchase-card__title">{product.name}</h2>
              <span className="stock-badge in-stock">
                <CheckCircle sx={{ fontSize: "16px" }} />В наявності
              </span>
            </div>
          </div>
        )}

        <div className="price-row">
          <div className="price">{formatPrice(product.price)}</div>
          <div className="product-actions-icons">
            <button
              className={`product-wishlist-button${actions.isWishlisted ? " active" : ""}`}
              onClick={actions.handleOpenWishlist}
              title={
                actions.isWishlisted
                  ? "Додати в інший список"
                  : "Додати до списку бажань"
              }
            >
              {actions.isWishlisted ? (
                <Favorite sx={{ fontSize: "28px" }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: "28px" }} />
              )}
            </button>
            <button
              className={`product-compare-button${actions.isCompared ? " active" : ""}`}
              onClick={actions.handleToggleCompare}
              title={
                actions.isCompared
                  ? "Видалити з порівняння"
                  : "Додати до порівняння"
              }
            >
              <Balance sx={{ fontSize: "28px" }} />
            </button>
          </div>
        </div>

        <div className="product-actions-wrapper">
          {actions.isInCart ? (
            <button className="btn-primary btn-with-icon" onClick={actions.handleGoToCart}>
              <ShoppingCart sx={{ fontSize: "20px" }} />
              Перейти до кошика
            </button>
          ) : (
            <button className="btn-primary btn-with-icon" onClick={actions.handleAddToCart}>
              <ShoppingCartOutlined sx={{ fontSize: "20px" }} />
              Додати в кошик
            </button>
          )}
        </div>
      </div>

      <WishlistPickerModal
        isOpen={actions.isWishlistModalOpen}
        onClose={actions.handleCloseWishlist}
        product={product}
      />
    </>
  );
};

export default ProductPurchaseCard;
