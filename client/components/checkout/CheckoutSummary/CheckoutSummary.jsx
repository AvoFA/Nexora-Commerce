import { Link } from "react-router-dom";
import {
  ArrowBack,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  StorefrontOutlined,
} from "@mui/icons-material";
import { formatPrice } from "../../../utils/formatPrice.js";

const CheckoutSummary = ({
  items,
  totalPrice: itemsTotalPrice,
  deliveryPrice,
  activeStep,
  isSubmitting,
  itemsContainerRef,
  scrollLeft,
  maxScroll,
  onScrollLeft,
  onScrollRight,
  onEditItems,
  onContinueToPayment,
  onContinueToConfirmation,
  onBackToCart,
}) => {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = itemsTotalPrice + deliveryPrice;

  return (
    <div className="checkout-summary">
      <div className="summary-header">
        <h2>Товари {itemCount}</h2>
        <button
          type="button"
          className="btn-edit-items"
          onClick={onEditItems}
        >
          Редагувати товари <ChevronRight className="edit-arrow" />
        </button>
      </div>

      <div className="card-content">
        <div className="summary-items-wrapper">
          {scrollLeft > 5 && (
            <button
              type="button"
              className="btn-scroll-left"
              onClick={onScrollLeft}
              title="Гортати назад"
            >
              <ArrowBack className="scroll-arrow" />
            </button>
          )}

          <div className="summary-items" ref={itemsContainerRef}>
            {items.map((item) => (
              <Link
                key={item._id || item.id}
                to={`/product/${item._id || item.id}`}
                className="summary-product-item"
              >
                <div className="summary-product-image-wrapper">
                  {item.image || item.imageUrl ? (
                    <img src={item.image || item.imageUrl} alt={item.name} />
                  ) : (
                    <StorefrontOutlined />
                  )}
                </div>
                <div className="summary-product-info">
                  <span className="summary-product-price">{formatPrice(item.price)}</span>
                  <span className="summary-product-quantity">x {item.quantity} од.</span>
                </div>
              </Link>
            ))}
          </div>

          {scrollLeft < maxScroll - 5 && items.length > 2 && (
            <button
              type="button"
              className="btn-scroll-right"
              onClick={onScrollRight}
              title="Гортати вперед"
            >
              <ArrowForward className="scroll-arrow" />
            </button>
          )}
        </div>

        <div className="summary-breakdown">
          <div className="summary-row">
            <span>{itemCount} товарів на суму:</span>
            <span>{formatPrice(itemsTotalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Доставка:</span>
            <span className={deliveryPrice === 0 ? "free" : ""}>
              {deliveryPrice === 0 ? "Безкоштовно" : formatPrice(deliveryPrice)}
            </span>
          </div>
        </div>

        <div className="summary-total">
          <strong>Загальна сума:</strong>
          <strong>{formatPrice(finalTotal)}</strong>
        </div>

        {activeStep === 1 ? (
          <button
            type="button"
            className="btn-checkout-submit"
            onClick={onContinueToPayment}
          >
            Продовжити <ChevronRight className="arrow-continue" />
          </button>
        ) : activeStep === 2 ? (
          <button
            type="button"
            className="btn-checkout-submit"
            onClick={onContinueToConfirmation}
          >
            Продовжити <ChevronRight className="arrow-continue" />
          </button>
        ) : (
          <button
            type="submit"
            className="btn-checkout-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Створюємо замовлення..." : "Оформити замовлення"}
          </button>
        )}

        <button
          type="button"
          className="btn-back-to-cart"
          onClick={onBackToCart}
        >
          <ChevronLeft className="back-arrow" />
          Назад до кошика
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;
