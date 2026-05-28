import { useEffect, useRef, useState } from "react";
import {
  Balance,
  CheckCircle,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { formatPrice, getProductDiscountAmount, hasProductDiscount } from "../../../utils/formatPrice.js";
import WishlistPickerModal from "../../common/WishlistPickerModal/WishlistPickerModal.jsx";
import { useProductActions } from "../hooks/useProductActions.js";
import "./ProductPurchaseCard.scss";

const getProductImage = (product) => product?.image || product?.imageUrl || null;

const ProductPurchaseCard = ({ product, variant = "full" }) => {
  const actions = useProductActions(product);
  const [isAuthTooltipVisible, setIsAuthTooltipVisible] = useState(false);
  const authTooltipTimerRef = useRef(null);
  const isCompact = variant === "compact";
  const imgSrc = getProductImage(product);
  const hasDiscount = hasProductDiscount(product);
  const discountAmount = getProductDiscountAmount(product);

  useEffect(() => () => {
    window.clearTimeout(authTooltipTimerRef.current);
  }, []);

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

  const handleWishlistClick = (event) => {
    if (!actions.isAuthenticated) {
      const isMobile = window.innerWidth <= 768 || window.matchMedia("(hover: none)").matches;

      if (isMobile && !isAuthTooltipVisible) {
        showAuthTooltip();
        window.clearTimeout(authTooltipTimerRef.current);
        authTooltipTimerRef.current = window.setTimeout(() => {
          setIsAuthTooltipVisible(false);
        }, 3000);
        return;
      }
    }
    actions.handleOpenWishlist(event);
  };

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
          <div className="product-price-stack">
            {hasDiscount && (
              <div className="product-discount-row">
                <span className="product-old-price">{formatPrice(product.compareAtPrice)}</span>
                <span className="product-discount-badge">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="price">{formatPrice(product.price)}</div>
          </div>
          <div className="product-actions-icons">
            <button
              className={`product-wishlist-button${actions.isWishlisted ? " active" : ""}`}
              onClick={handleWishlistClick}
              onMouseEnter={!actions.isAuthenticated ? () => { if (window.innerWidth > 768) showAuthTooltip(); } : undefined}
              onMouseLeave={!actions.isAuthenticated ? () => { if (window.innerWidth > 768) hideAuthTooltip(); } : undefined}
              onFocus={!actions.isAuthenticated ? () => { if (window.innerWidth > 768) showAuthTooltip(); } : undefined}
              onBlur={!actions.isAuthenticated ? () => { if (window.innerWidth > 768) hideAuthTooltip(); } : undefined}
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
            {!actions.isAuthenticated && (
              <div
                className={`product-wishlist-tooltip${isAuthTooltipVisible ? " visible" : ""}`}
                role="tooltip"
                onMouseEnter={showAuthTooltip}
                onMouseLeave={hideAuthTooltip}
              >
                <button
                  type="button"
                  className="product-wishlist-tooltip__link"
                  onClick={actions.handleOpenWishlist}
                >
                  Авторизуйтесь
                </button>
                <span>, щоб додати товар до обраного</span>
              </div>
            )}
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
            <button className="btn-primary btn-with-icon btn-go-to-cart" onClick={actions.handleGoToCart}>
              <ShoppingCart sx={{ fontSize: "20px" }} />
              <span className="btn-cart-text btn-cart-text--desktop">Перейти до кошика</span>
              <span className="btn-cart-text btn-cart-text--mobile">До кошику</span>
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
