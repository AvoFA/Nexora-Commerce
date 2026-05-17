import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from '../../../utils/formatPrice.js';
import {
  ExpandMore,
  Inventory2Outlined,
  LocalShippingOutlined,
  PaymentOutlined,
  RateReviewOutlined,
} from "@mui/icons-material";
import { getMyOrders } from "../../../services/orderService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
  SHOW_DEMO_ORDER_LAYOUT,
  ORDER_STEPS,
  STATUS_LABELS,
  STATUS_DESCRIPTIONS,
  TIMELINE_LABELS,
  PAYMENT_LABELS,
  ORDER_FILTERS,
  DEMO_ORDER,
} from "./orders.constants.js";


const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

const getCompletedSteps = (order) => {
  if (order.status === "cancelled") return new Set(["cancelled"]);

  const currentIndex = ORDER_STEPS.indexOf(order.status);
  const activeSteps = currentIndex >= 0
    ? ORDER_STEPS.slice(0, currentIndex + 1)
    : ["new"];

  return new Set(activeSteps);
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

const getDeliveryAddress = (delivery) => {
  const address = [delivery?.city, delivery?.address, delivery?.zip].filter(Boolean).join(", ");
  return address || "—";
};

const OrdersTab = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(!SHOW_DEMO_ORDER_LAYOUT);
  const [error, setError] = useState(null);

  const displayOrders = SHOW_DEMO_ORDER_LAYOUT ? [DEMO_ORDER] : orders;
  const activeFilterConfig = ORDER_FILTERS.find((filter) => filter.key === activeFilter) || ORDER_FILTERS[0];
  const filteredOrders = displayOrders.filter(activeFilterConfig.predicate);
  const realOrderCount = SHOW_DEMO_ORDER_LAYOUT ? displayOrders.length : orders.length;

  const getFilterCount = (filter) => displayOrders.filter(filter.predicate).length;

  const fetchOrders = async () => {
    if (SHOW_DEMO_ORDER_LAYOUT) {
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const data = await getMyOrders(token);
      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message || "Помилка завантаження замовлень");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [isAuthenticated]);

  const renderProductImage = (item) => {
    if (item.image) {
      return <img src={item.image} alt={item.name} />;
    }

    return <Inventory2Outlined />;
  };

  const renderTimeline = (order) => {
    const completedSteps = getCompletedSteps(order);
    const steps = order.status === "cancelled" ? ["cancelled"] : ORDER_STEPS;

    return (
      <div className="order-timeline">
        {steps.map((status) => {
          const historyEntry = order.history?.find((entry) => entry.status === status);
          const isActive = completedSteps.has(status);

          return (
            <div
              key={`${order._id}-${status}`}
              className={`order-timeline-item${isActive ? " active" : ""}`}
            >
              <span className="timeline-label">{TIMELINE_LABELS[status] || STATUS_LABELS[status]}</span>
              <span className="timeline-time">
                {historyEntry ? formatDate(historyEntry.timestamp) : STATUS_DESCRIPTIONS[status]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderOrder = (order) => {
    const previewItems = order.items?.slice(0, 3) || [];
    const itemCount = order.items?.length || 0;
    const itemsTotal = getItemsTotal(order);
    const discount = Number(order.discount) || 0;
    const deliveryPrice = Number(order.deliveryPrice) || 0;
    const totalPrice = Number(order.totalPrice) || itemsTotal - discount + deliveryPrice;

    return (
      <details key={order._id} className="order-card">
        <summary className="order-card-summary">
          <div>
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
            <span className="order-card-label">Сума</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>
          <div className="order-preview">
            {previewItems.map((item, index) => (
              <div className="order-preview-img" key={getItemKey(order, item, index)}>
                {renderProductImage(item)}
              </div>
            ))}
          </div>
          <ExpandMore className="order-expand-icon" />
        </summary>

        <div className="order-expanded">
          <div className="order-expanded-grid">
            <div className="products-block">
              {(order.items || []).map((item, index) => {
                const productId = getProductId(item);
                const quantity = Number(item.quantity) || 1;
                const productTotal = (Number(item.price) || 0) * quantity;

                return (
                  <div className="expanded-product" key={getItemKey(order, item, index)}>
                    <Link to={`/product/${productId}`} className="ex-img">
                      {renderProductImage(item)}
                    </Link>
                    <div className="ex-info">
                      <Link to={`/product/${productId}`}>{item.name}</Link>
                    </div>
                    <button className="ex-review-link" type="button">
                      <RateReviewOutlined />
                      Залишити відгук
                    </button>
                    <div className="ex-qty">{quantity} шт.</div>
                    <div className="ex-price">{formatPrice(productTotal)}</div>
                  </div>
                );
              })}
            </div>

            <div className="order-info-row">
              <div className="delivery-block">
                <div className="detail-block">
                  <h4>Доставка</h4>
                  <table className="info-table">
                    <tbody>
                      <tr>
                        <td>Запланована дата видачі:</td>
                        <td>{order.delivery?.plannedDate || "Уточнюється"}</td>
                      </tr>
                      <tr>
                        <td>Вид доставки:</td>
                        <td>{order.delivery?.type || "Доставка за адресою"}</td>
                      </tr>
                      <tr>
                        <td>Адреса доставки:</td>
                        <td>
                          {getDeliveryAddress(order.delivery)}
                          {order.delivery?.workHours && <small>{order.delivery.workHours}</small>}
                        </td>
                      </tr>
                      <tr>
                        <td>Отримувач:</td>
                        <td>
                          {order.customer?.name || order.customer?.phone || order.customer?.email ? (
                            <span className="delivery-recipient">
                              {order.customer?.name && (
                                <span className="delivery-recipient-name">{order.customer.name}</span>
                              )}
                              {order.customer?.phone && (
                                <span className="delivery-recipient-phone">{order.customer.phone}</span>
                              )}
                              {!order.customer?.phone && order.customer?.email && (
                                <span className="delivery-recipient-email">{order.customer.email}</span>
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="status-timeline-block">
                {renderTimeline(order)}
              </div>
            </div>

            <div className="payment-block">
              <div className="detail-block">
                <h4>Оплата</h4>
                <table className="payment-table">
                  <tbody>
                    <tr>
                      <td>Спосіб оплати:</td>
                      <td>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—"}</td>
                    </tr>
                    <tr>
                      <td>Товар ({itemCount}):</td>
                      <td>{formatPrice(itemsTotal)}</td>
                    </tr>
                    <tr>
                      <td>Доставка:</td>
                      <td className={deliveryPrice > 0 ? "" : "free"}>
                        {deliveryPrice > 0 ? formatPrice(deliveryPrice) : "Безкоштовно"}
                      </td>
                    </tr>
                    <tr className="total-row">
                      <td>Всього:</td>
                      <td>{formatPrice(totalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </details>
    );
  };

  const renderBoardContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="orders-board-empty">
          <Inventory2Outlined sx={{ fontSize: 48 }} />
          <h2>Увійдіть, щоб переглянути замовлення</h2>
          <p>Після входу тут з'явиться історія ваших покупок, статуси та деталі доставки.</p>
          <Link to="/catalog" className="btn-primary">
            Перейти до каталогу
          </Link>
        </div>
      );
    }

    if (loading) {
      return <div className="orders-board-empty orders-board-empty-compact">Завантаження замовлень...</div>;
    }

    if (error) {
      return (
        <div className="orders-board-empty">
          <Inventory2Outlined sx={{ fontSize: 48 }} />
          <h2>Помилка завантаження</h2>
          <p>{error}</p>
          <button className="btn-secondary" type="button" onClick={fetchOrders}>
            Спробувати знову
          </button>
        </div>
      );
    }

    if (displayOrders.length === 0) {
      return (
        <div className="orders-board-empty">
          <Inventory2Outlined sx={{ fontSize: 48 }} />
          <h2>У вас поки що немає замовлень</h2>
          <p>Оформіть першу покупку, і вона з'явиться в цьому розділі.</p>
          <Link to="/catalog" className="btn-primary">
            Перейти до каталогу
          </Link>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="orders-board-empty">
          <Inventory2Outlined sx={{ fontSize: 48 }} />
          <h2>У цьому розділі немає замовлень</h2>
          <p>Змініть фільтр або поверніться до всіх замовлень.</p>
          <button className="btn-secondary" type="button" onClick={() => setActiveFilter("all")}>
            Показати всі
          </button>
        </div>
      );
    }

    return (
      <div className="orders-list">
        {filteredOrders.map((order) => renderOrder(order))}
      </div>
    );
  };

  return (
    <div className="orders-tab">
      <div className="orders-module">
        <div className="orders-toolbar">
          <div className="orders-toolbar-main">
            <div className="orders-heading">
              <h2>Мої замовлення</h2>
              <p>Переглядайте історію покупок, статуси та деталі доставки.</p>
            </div>

            <div className="orders-filter-tabs" aria-label="Фільтр замовлень">
              {ORDER_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`orders-filter-tab${activeFilter === filter.key ? " active" : ""}`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label} <span>({getFilterCount(filter)})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="orders-summary-pill">
            <Inventory2Outlined />
            <strong>{realOrderCount}</strong>
            <span>замовлень</span>
          </div>
        </div>

        <div className="orders-board">
          <div className="orders-board-head">
            <div>
              <h3>Історія замовлень</h3>
              <p>{filteredOrders.length} з {displayOrders.length} покупок у вашому кабінеті</p>
            </div>
          </div>

          {renderBoardContent()}
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
