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
import CancelOrderModal from "../../../components/common/CancelOrderModal/CancelOrderModal.jsx";
import LeaveReviewModal from "../../../components/common/LeaveReviewModal/LeaveReviewModal.jsx";
import { cancelOrder } from "../../../services/orderService.js";
import { createReview } from "../../../services/reviewService.js";
import { toast } from "sonner";

const OrdersTab = () => {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(!SHOW_DEMO_ORDER_LAYOUT);
  const [error, setError] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);

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

  const handleOpenCancelModal = (order) => {
    setSelectedOrderForCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedOrderForCancel(null);
  };

  const handleCancelConfirm = async ({ reason, comment }) => {
    if (!selectedOrderForCancel) return;

    try {
      const token = localStorage.getItem("token");
      await cancelOrder(selectedOrderForCancel._id, { reason, comment }, token);

      toast.success("Замовлення успішно скасовано");
      handleCloseCancelModal();
      fetchOrders(); // Refresh orders after cancellation
    } catch (err) {
      toast.error(err.message || "Помилка при скасуванні замовлення");
    }
  };

  const handleOpenReviewModal = (item) => {
    // Map order item to a product-like object for the modal
    const product = {
      _id: item.product?._id || item.product || item._id,
      name: item.name
    };
    setSelectedProductForReview(product);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedProductForReview(null);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem("token");
      await createReview(reviewData, token);
      toast.success("Відгук надіслано на модерацію!");
      handleCloseReviewModal();
    } catch (err) {
      toast.error(err.message || "Не вдалося надіслати відгук");
    }
  };

  const renderBoardContent = () => {
    if (!isAuthenticated) return <OrderEmptyState state="unauthenticated" />;
    if (loading) return <OrderEmptyState state="loading" />;
    if (error) return <OrderEmptyState state="error" error={error} onRetry={fetchOrders} />;
    if (displayOrders.length === 0) return <OrderEmptyState state="no-orders" />;
    if (filteredOrders.length === 0) return <OrderEmptyState state="no-filtered" onResetFilter={() => setActiveFilter("all")} />;

    return (
      <div className="orders-list">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onCancelRequest={() => handleOpenCancelModal(order)}
            onReviewRequest={handleOpenReviewModal}
          />
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
              <span className="orders-mobile-count">
                {displayOrders.length} покупок у вашому кабінеті
              </span>
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
            </div>
          </div>

          {renderBoardContent()}
        </div>
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelConfirm}
        orderNumber={selectedOrderForCancel?._id}
      />

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        product={selectedProductForReview}
        onSubmit={handleReviewSubmit}
        user={user}
      />
    </div>
  );
};

export default OrdersTab;
