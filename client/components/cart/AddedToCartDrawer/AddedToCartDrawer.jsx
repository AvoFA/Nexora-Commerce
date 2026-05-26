import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Close, Add, Remove, ShoppingCart } from "@mui/icons-material";
import { useCart } from "../../../hooks/useCart.js";
import { formatPrice } from "../../../utils/formatPrice.js";
import "./AddedToCartDrawer.scss";

const AddedToCartDrawer = () => {
  const { state, dispatch } = useCart();
  const { isDrawerOpen, addedProduct, items } = state;
  const navigate = useNavigate();

  // Знаходимо поточний доданий товар в кошику, щоб взяти актуальну кількість
  const cartItem = items.find((item) => item.id === addedProduct?.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Блокуємо прокрутку сторінки, коли шторку відкрито
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen || !addedProduct) return null;

  const handleClose = () => {
    dispatch({ type: "CLOSE_DRAWER" });
  };

  const handleIncrease = () => {
    dispatch({ type: "ADD_ITEM", payload: addedProduct });
  };

  const handleDecrease = () => {
    dispatch({ type: "REMOVE_ITEM", payload: addedProduct.id });
  };

  const handleGoToCart = () => {
    handleClose();
    navigate("/cart");
  };

  const handleCheckout = () => {
    handleClose();
    navigate("/checkout");
  };

  // Отримуємо посилання на зображення
  const imgSrc = addedProduct.image || (addedProduct.images && addedProduct.images[0]);

  return (
    <div className="added-to-cart-portal">
      {/* Затемнення заднього плану */}
      <div className="added-to-cart-overlay" onClick={handleClose} />

      {/* Сама висувна шторка */}
      <div className="added-to-cart-drawer">
        {/* Шапка шторки */}
        <div className="drawer-header">
          <h2 className="drawer-title">Товар додано до кошика</h2>
          <button className="btn-close-drawer" onClick={handleClose} title="Закрити">
            <Close />
          </button>
        </div>

        {/* Вміст із доданим товаром */}
        <div className="drawer-content">
          <div className="added-product-card">
            <div className="added-product-card-top">
              <div className="product-image-container">
                {imgSrc ? (
                  <img src={imgSrc} alt={addedProduct.name} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">Ні</div>
                )}
              </div>

              <h3 className="product-name" title={addedProduct.name}>
                {addedProduct.name}
              </h3>
            </div>

            <div className="added-product-card-bottom">
              {/* Селектор кількості всередині швидкого кошика */}
              <div className="quantity-selector">
                <button
                  className="quantity-btn decrease"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  title="Зменшити"
                >
                  <Remove fontSize="small" />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn increase"
                  onClick={handleIncrease}
                  title="Збільшити"
                >
                  <Add fontSize="small" />
                </button>
              </div>

              <span className="product-price">
                {formatPrice(addedProduct.price * quantity)}
              </span>
            </div>
          </div>
        </div>

        {/* Кнопки дій */}
        <div className="drawer-actions">
          <button className="btn-drawer-action btn-go-cart" onClick={handleGoToCart}>
            <ShoppingCart fontSize="small" />
            Перейти до кошика
          </button>

          <button className="btn-drawer-action btn-checkout" onClick={handleCheckout}>
            Оформити замовлення
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddedToCartDrawer;
