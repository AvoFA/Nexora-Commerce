import { useEffect, useState } from "react";
import { Inventory2Outlined } from "@mui/icons-material";
import { getMyOrders } from "../../../services/orderService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
  SHOW_DEMO_ORDER_LAYOUT,
  ORDER_FILTERS,
  DEMO_ORDER,
} from "./orders.constants.js";
import OrderCard from "./OrderCard.jsx";
import OrderEmptyState from "./OrderEmptyState.jsx";

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

  const renderBoardContent = () => {
    if (!isAuthenticated) return <OrderEmptyState state="unauthenticated" />;
    if (loading) return <OrderEmptyState state="loading" />;
    if (error) return <OrderEmptyState state="error" error={error} onRetry={fetchOrders} />;
    if (displayOrders.length === 0) return <OrderEmptyState state="no-orders" />;
    if (filteredOrders.length === 0) return <OrderEmptyState state="no-filtered" onResetFilter={() => setActiveFilter("all")} />;

    return (
      <div className="orders-list">
        {filteredOrders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
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
