import { Link } from "react-router-dom";
import { formatPrice, getProductDiscountAmount, hasProductDiscount } from "../../../utils/formatPrice.js";
import { ExpandMore, Inventory2Outlined, RateReviewOutlined, CloseOutlined } from "@mui/icons-material";
import { STATUS_LABELS } from "./orders.constants.js";
import OrderTimeline from "./OrderTimeline.jsx";
import OrderDeliveryBlock from "./OrderDeliveryBlock.jsx";
import OrderPaymentBlock from "./OrderPaymentBlock.jsx";

const formatShortDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getOrderNumber = (order) => {
  const raw = order?._id || "";
  return raw ? `№ ${raw.slice(-6).toUpperCase()}` : "—";
};

const getProductId = (item) => item.product?._id || item.product || item._id;

const getItemKey = (order, item, index) => {
  const productId = getProductId(item) || index;
  return `${order._id}-${productId}-${index}`;
};

const getItemsTotal = (order) => (order.items || []).reduce(
  (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
  0
);

const getItemsOriginalTotal = (order) => (order.items || []).reduce((sum, item) => {
  const quantity = Number(item.quantity) || 1;
  const unitPrice = hasProductDiscount(item) ? Number(item.compareAtPrice) : Number(item.price) || 0;
  return sum + unitPrice * quantity;
}, 0);

const renderProductImage = (item) => {
  if (item.image) {
    return <img src={item.image} alt={item.name} />;
  }

  return <Inventory2Outlined />;
};

const OrderCard = ({ order, onCancelRequest, onReviewRequest }) => {
  const previewItems = order.items?.slice(0, 3) || [];
  const itemCount = order.items?.length || 0;
  const itemsTotal = getItemsTotal(order);
  const itemsOriginalTotal = getItemsOriginalTotal(order);
  const itemsDiscount = itemsOriginalTotal - itemsTotal;
  const discount = Number(order.discount) || 0;
  const deliveryPrice = Number(order.deliveryPrice) || Number(order.delivery?.deliveryPrice) || 0;
  const totalPrice = Number(order.totalPrice) || itemsTotal - discount + deliveryPrice;

  return (
    <details className="order-card">
      <summary className="order-card-summary">
        <div className="order-summary-number">
          <span className="order-card-label">Замовлення</span>
          <strong>{getOrderNumber(order)}</strong>
        </div>
        <div>
          <span className="order-card-label">Дата</span>
          <strong>{formatShortDate(order.createdAt)}</strong>
        </div>
        <div className="order-card-status-cell">
          <span className={`order-status order-status-${order.status}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <div>
          <span className="order-card-label">Сума замовлення</span>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>
        <div className="order-preview">
          {previewItems.map((item, index) => (
            <div className="order-preview-img" key={getItemKey(order, item, index)}>
              {renderProductImage(item)}
            </div>
          ))}
          {itemCount > previewItems.length && (
            <span className="order-preview-more">+{itemCount - previewItems.length}</span>
          )}
        </div>
        <span className="order-details-toggle">
          <span>Детальніше</span>
          <ExpandMore className="order-expand-icon" />
        </span>
      </summary>

      <div className="order-expanded">
        <div className="order-expanded-grid">
          <div className="products-block">
            {(order.items || []).map((item, index) => {
              const productId = getProductId(item);
              const quantity = Number(item.quantity) || 1;
              const productTotal = (Number(item.price) || 0) * quantity;
              const productDiscount = getProductDiscountAmount(item) * quantity;

              return (
                <div className="expanded-product" key={getItemKey(order, item, index)}>
                  <Link to={`/product/${productId}`} className="ex-img">
                    {renderProductImage(item)}
                  </Link>
                  <div className="ex-info">
                    <Link to={`/product/${productId}`}>{item.name}</Link>
                  </div>
                  <button
                    className="ex-review-link"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onReviewRequest) onReviewRequest(item);
                    }}
                  >
                    <RateReviewOutlined />
                    Залишити відгук
                  </button>
                  <div className="ex-qty">{quantity} шт.</div>
                  <div className="ex-price">
                    {hasProductDiscount(item) && (
                      <div className="ex-price-discount-row">
                        <span className="ex-old-price">{formatPrice(Number(item.compareAtPrice) * quantity)}</span>
                        <span className="ex-discount">-{formatPrice(productDiscount)}</span>
                      </div>
                    )}
                    <strong>{formatPrice(productTotal)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-info-row">
            <OrderDeliveryBlock order={order} />
            <OrderTimeline order={order} />
          </div>

          <OrderPaymentBlock
            order={order}
            itemCount={itemCount}
            itemsTotal={itemsTotal}
            itemsOriginalTotal={itemsOriginalTotal}
            itemsDiscount={itemsDiscount}
            deliveryPrice={deliveryPrice}
            totalPrice={totalPrice}
          />

          {(order.status === 'new' || order.status === 'confirmed') && (
            <div className="order-actions-section">
              <button
                type="button"
                className="cancel-order-btn"
                onClick={onCancelRequest}
              >
                <CloseOutlined />
                Скасувати замовлення
              </button>
            </div>
          )}
        </div>
      </div>
    </details>
  );
};

export default OrderCard;
