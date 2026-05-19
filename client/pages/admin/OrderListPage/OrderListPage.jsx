import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Inventory2Outlined,
  VisibilityOutlined,
  PersonOutline,
  LocalShippingOutlined,
  PaymentOutlined,
  CommentOutlined,
  History as HistoryIcon,
  ReportProblemOutlined,
} from "@mui/icons-material";
import { toast } from "sonner";
import { getAdminOrders, updateOrderStatus } from "../../../services/orderService";
import { formatPrice } from "../../../utils/formatPrice";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";

import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./OrderListPage.scss";

const statusColorMap = {
  new: "info",
  confirmed: "primary",
  packing: "warning",
  ready_for_pickup: "secondary",
  received: "success",
  cancelled: "error",
};

const statusLabelMap = {
  new: "Нове",
  confirmed: "Підтверджено",
  packing: "Комплектується",
  ready_for_pickup: "Відправлено",
  received: "Отримано",
  cancelled: "Скасовано",
};

const filterOptions = [
  { value: "new", label: "Нові", predicate: (order) => order.status === "new" },
  {
    value: "processing",
    label: "В обробці",
    predicate: (order) => ["confirmed", "packing"].includes(order.status),
  },
  {
    value: "ready_for_pickup",
    label: "Відправлено",
    predicate: (order) => order.status === "ready_for_pickup",
  },
  {
    value: "received",
    label: "Отримано",
    predicate: (order) => order.status === "received",
  },
  {
    value: "cancelled",
    label: "Скасовано",
    predicate: (order) => order.status === "cancelled",
  },
  { value: "all", label: "Усі", predicate: () => true },
];

// ==========================================
// ТИМЧАСОВО ДЛЯ ТЕСТІВ / TEMPORARILY FOR TESTING:
// Встановіть true, щоб дозволити переходи в будь-які статуси (включаючи скасовані/отримані)
// Set to true to allow transitioning to any status (including reverting terminal received/cancelled states)
const IS_TEST_MODE = true;
// ==========================================

const terminalStatuses = new Set(["received", "cancelled"]);

const allowedTransitionsMap = {
  new: ["confirmed", "cancelled"],
  confirmed: ["packing", "cancelled"],
  packing: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["received", "cancelled"],
  received: [],
  cancelled: [],
};

const getOrderNumber = (order) => {
  const raw = order?._id || "";
  return raw ? `#${raw.slice(-6).toUpperCase()}` : "—";
};

const formatOrderDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatOrderTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getItemsTotal = (order) =>
  (order.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  );

const getOrderTotal = (order) => Number(order.totalPrice) || getItemsTotal(order);

const getDeliveryAddress = (delivery) =>
  [delivery?.city, delivery?.address, delivery?.zip].filter(Boolean).join(", ") || "—";

const getItemKey = (order, item, index) => {
  const productId = item.product?._id || item.product || item._id || index;
  return `${order._id}-${productId}-${index}`;
};

const renderProductThumb = (item, className = "") => {
  if (item?.image) {
    return <img src={item.image} alt={item.name || "Товар"} />;
  }

  return <Inventory2Outlined className={className} />;
};

const StatusDropdown = ({ status, onChange, disabled, isUpdating, isOpen, onToggle }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onToggle(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen, onToggle]);

  const currentLabel = statusLabelMap[status] || status;
  const isTerminal = disabled || (IS_TEST_MODE ? false : terminalStatuses.has(status));

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isTerminal && !isUpdating) {
      onToggle(!isOpen);
    }
  };

  const handleSelect = (key, e) => {
    e.stopPropagation();
    onToggle(false);
    onChange(key);
  };

  return (
    <div
      ref={dropdownRef}
      className={`status-dropdown ${isOpen ? "is-open" : ""} ${isTerminal ? "is-disabled" : ""}`}
    >
      <button
        type="button"
        className="status-dropdown-trigger"
        onClick={handleToggle}
        disabled={isTerminal || isUpdating}
      >
        <span className="trigger-label">{currentLabel}</span>
        {!isTerminal && (
          <span className="chevron-wrapper">
            <svg
              className="chevron-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              width="14"
              height="14"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </button>
      {isOpen && (
        <div className="status-dropdown-menu">
          {Object.entries(statusLabelMap).map(([key, label]) => {
            const isSelected = key === status;
            const isAllowed = IS_TEST_MODE ? true : allowedTransitionsMap[status]?.includes(key);
            const isItemDisabled = !isSelected && !isAllowed;

            return (
              <button
                key={key}
                type="button"
                className={`status-dropdown-item ${isSelected ? "is-selected" : ""} ${isItemDisabled ? "is-disabled" : ""}`}
                disabled={isItemDisabled}
                onClick={(e) => handleSelect(key, e)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [activeFilter, setActiveFilter] = useState("new");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState(null);
  const [cancelConfirmation, setCancelConfirmation] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: ""
  });
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        toast.error("Токен відсутній. Увійдіть в систему.");
        return;
      }
      const data = await getAdminOrders(token);
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      toast.error(error.message || "Помилка завантаження замовлень");
      const isTokenError =
        error.message &&
        (error.message.includes("токен") ||
          error.message.includes("Токен") ||
          error.message.includes("token") ||
          error.message.includes("Token") ||
          error.message.includes("auth") ||
          error.message.includes("Auth"));
      if (isTokenError) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await updateOrderStatus(id, newStatus, token);
      if (data.success) {
        toast.success(data.message || "Статус замовлення оновлено");
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id
              ? { ...order, status: newStatus, history: data.order?.history || order.history }
              : order
          )
        );
        setSelectedOrderForModal((current) =>
          current?._id === id
            ? { ...current, status: newStatus, history: data.order?.history || current.history }
            : current
        );
      }
    } catch (error) {
      toast.error(error.message || "Помилка оновлення статусу");
      const isTokenError =
        error.message &&
        (error.message.includes("токен") ||
          error.message.includes("Токен") ||
          error.message.includes("token") ||
          error.message.includes("Token") ||
          error.message.includes("auth") ||
          error.message.includes("Auth"));
      if (isTokenError) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusChangeAttempt = (order, newStatus) => {
    if (newStatus === "cancelled") {
      setCancelConfirmation({
        isOpen: true,
        orderId: order._id,
        orderNumber: getOrderNumber(order)
      });
    } else {
      handleStatusChange(order._id, newStatus);
    }
  };

  const counts = filterOptions.reduce((acc, option) => {
    acc[option.value] = orders.filter(option.predicate).length;
    return acc;
  }, {});

  const activeFilterConfig =
    filterOptions.find((option) => option.value === activeFilter) || filterOptions[0];
  const filteredOrders = orders.filter(activeFilterConfig.predicate);

  const overviewStats = {
    new: counts.new || 0,
    shipped: counts.ready_for_pickup || 0,
    cancelled: counts.cancelled || 0,
    all: orders.length,
  };

  const renderProductsPreview = (order) => {
    const items = order.items || [];
    const previewItems = items.slice(0, 3);
    const extraCount = items.length - 1;

    return (
      <Box className="products-preview">
        <div className="products-thumb-stack">
          {previewItems.map((item, index) => (
            <Tooltip
              key={getItemKey(order, item, index)}
              title={item.name || "Товар"}
              arrow
              placement="top"
            >
              <Avatar
                className="product-thumb"
                variant="rounded"
              >
                {renderProductThumb(item)}
              </Avatar>
            </Tooltip>
          ))}
        </div>
        <div className="products-preview-copy">
          <Typography variant="body2" className="products-main">
            {items[0]?.name || "Товари не вказані"}
          </Typography>
          {extraCount > 0 && (
            <span className="products-extra-text">
              +{extraCount} ще
            </span>
          )}
        </div>
      </Box>
    );
  };

  const renderStatusChip = (status) => (
    <Chip
      label={statusLabelMap[status] || status}
      color={statusColorMap[status] || "default"}
      size="small"
      variant={status === "new" ? "outlined" : "filled"}
      className={`order-status-chip order-status-${status}`}
    />
  );

  return (
    <Box className="order-list-page">
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Керування замовленнями
          </Typography>
          <Typography variant="body2" className="subtitle">
            Огляд, фільтрація та оновлення статусів клієнтських замовлень
          </Typography>
        </div>
      </Box>

      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-secondary">
          <span className="stat-card-label">Нових замовлень</span>
          <span className="stat-card-value">{overviewStats.new}</span>
          <span className="stat-card-subtext">Очікують на підтвердження</span>
        </div>
        <div className="admin-stat-card stat-success">
          <span className="stat-card-label">Відправлено</span>
          <span className="stat-card-value">{overviewStats.shipped}</span>
          <span className="stat-card-subtext">Замовлення в дорозі</span>
        </div>
        <div className="admin-stat-card stat-danger">
          <span className="stat-card-label">Скасовано</span>
          <span className="stat-card-value">{overviewStats.cancelled}</span>
          <span className="stat-card-subtext">Відхилені замовлення</span>
        </div>
        <div className="admin-stat-card stat-primary">
          <span className="stat-card-label">Загальна кількість</span>
          <span className="stat-card-value">{overviewStats.all}</span>
          <span className="stat-card-subtext">За весь час роботи</span>
        </div>
      </div>

      <TableContainer component={Paper} className="admin-table-container">
        <div className="table-header-tabs-bar">
          <div className="filter-tabs" aria-label="Фільтр замовлень">
            {filterOptions.map((option) => {
              const isActive = activeFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFilter(option.value)}
                  className={`filter-tab-button ${isActive ? "active" : ""}`}
                >
                  <span>{option.label}</span>
                  <Chip label={counts[option.value] || 0} size="small" />
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№ Замовлення</TableCell>
                <TableCell>Клієнт</TableCell>
                <TableCell>Товари</TableCell>
                <TableCell>Сума</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Немає замовлень
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order._id}
                    className={terminalStatuses.has(order.status) ? "terminal-order-row" : ""}
                  >
                    <TableCell>
                      <Box className="order-number-cell">
                        <Typography variant="body2" className="order-number">
                          {getOrderNumber(order)}
                        </Typography>
                        <Typography variant="caption" className="order-time">
                          {formatOrderTime(order.createdAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box className="customer-cell">
                        <Typography variant="body2" className="customer-name">
                          {order.customer?.name || "—"}
                        </Typography>
                        {order.customer?.email && (
                          <Typography variant="caption" className="customer-email">
                            {order.customer.email}
                          </Typography>
                        )}
                        <div className="customer-meta-row">
                          {order.customer?.phone && (
                            <span className="customer-phone">{order.customer.phone}</span>
                          )}
                          <span>{formatOrderDate(order.createdAt)}</span>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>{renderProductsPreview(order)}</TableCell>
                    <TableCell>
                      <Box className="total-cell">
                        <Typography variant="body2" className="total-value">
                          {formatPrice(getOrderTotal(order))}
                        </Typography>
                        <div className="total-meta-row">
                          <span className="total-payment-method">
                            {order.paymentMethod === "card" ? "Онлайн" : "При отриманні"}
                          </span>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>{renderStatusChip(order.status)}</TableCell>
                    <TableCell align="right">
                      <Box className="actions-cell">
                        <Tooltip title="Деталі замовлення">
                          <IconButton
                            size="small"
                            className="view-order-btn"
                            onClick={() => setSelectedOrderForModal(order)}
                          >
                            <VisibilityOutlined />
                          </IconButton>
                        </Tooltip>
                        <StatusDropdown
                          status={order.status}
                          onChange={(newStatus) => handleStatusChangeAttempt(order, newStatus)}
                          disabled={
                            isUpdating === order._id ||
                            (IS_TEST_MODE ? false : (order.status === "cancelled" || order.status === "received"))
                          }
                          isUpdating={isUpdating === order._id}
                          isOpen={activeDropdownOrderId === order._id}
                          onToggle={(isOpen) => setActiveDropdownOrderId(isOpen ? order._id : null)}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog
        open={Boolean(selectedOrderForModal)}
        onClose={() => setSelectedOrderForModal(null)}
        className="order-detail-dialog"
        maxWidth="md"
        fullWidth
      >
        <button
          onClick={() => setSelectedOrderForModal(null)}
          className="admin-modal-close-btn"
          aria-label="закрити"
          type="button"
        >
          <CloseIcon />
        </button>
        <DialogTitle sx={{ p: 0 }}>
          {selectedOrderForModal && (
            <Box className="modal-header-compact">
              <div className="modal-header-main">
                <div className="modal-header-title-row">
                  <Typography variant="h3" className="modal-title-text">
                    {getOrderNumber(selectedOrderForModal)}
                  </Typography>
                  <div className="modal-header-status-wrapper">
                    {renderStatusChip(selectedOrderForModal.status)}
                  </div>
                </div>
                <div className="modal-header-created-row">
                  <span className="modal-created-label">Створено: </span>
                  <span className="modal-date">
                    {formatOrderDate(selectedOrderForModal.createdAt)} · {formatOrderTime(selectedOrderForModal.createdAt)}
                  </span>
                  {terminalStatuses.has(selectedOrderForModal.status) && (
                    <>
                      <span className="modal-subtitle-divider">·</span>
                      <span className="terminal-note">Фінальний статус</span>
                    </>
                  )}
                </div>
              </div>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedOrderForModal && (
            <Box className="order-modal-content">
              <Box className="modal-info-grid">
                <div className="modal-section-card">
                  <div className="section-header">
                    <PersonOutline className="section-icon" />
                    <span className="section-label">Клієнт</span>
                  </div>
                  <Typography variant="body2" className="section-title">
                    {selectedOrderForModal.customer?.name || "—"}
                  </Typography>
                  <span>{selectedOrderForModal.customer?.email || "—"}</span>
                  <span>{selectedOrderForModal.customer?.phone || "—"}</span>
                </div>

                <div className="modal-section-card">
                  <div className="section-header">
                    <LocalShippingOutlined className="section-icon" />
                    <span className="section-label">Доставка</span>
                  </div>
                  <Typography variant="body2" className="section-title">
                    {getDeliveryAddress(selectedOrderForModal.delivery)}
                  </Typography>
                  <span>{selectedOrderForModal.delivery?.type || "Адресна доставка"}</span>
                  {selectedOrderForModal.delivery?.plannedDate && (
                    <span>Планова дата: {selectedOrderForModal.delivery.plannedDate}</span>
                  )}
                </div>

                <div className="modal-section-card">
                  <div className="section-header">
                    <PaymentOutlined className="section-icon" />
                    <span className="section-label">Оплата</span>
                  </div>
                  <Typography variant="body2" className="section-title">
                    {selectedOrderForModal.paymentMethod === "card"
                      ? "Карткою онлайн"
                      : "Оплата при отриманні"}
                  </Typography>
                  <span>Разом: {formatPrice(getOrderTotal(selectedOrderForModal))}</span>
                </div>
              </Box>

              <div className="modal-products-section">
                <div className="products-section-header">
                  <span className="section-label">Товари</span>
                  <div className="products-summary-badge">
                    <span className="summary-qty">
                      {(selectedOrderForModal.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)} поз.
                    </span>
                    <span className="summary-divider">·</span>
                    <span className="summary-total">
                      {formatPrice(getOrderTotal(selectedOrderForModal))}
                    </span>
                  </div>
                </div>
                <div className="modal-products-list">
                  {(selectedOrderForModal.items || []).map((item, index) => {
                    const quantity = Number(item.quantity) || 1;
                    const itemTotal = (Number(item.price) || 0) * quantity;

                    return (
                      <div
                        className="modal-product-row"
                        key={getItemKey(selectedOrderForModal, item, index)}
                      >
                        <div className="modal-product-image">{renderProductThumb(item)}</div>
                        <div className="modal-product-copy">
                          <Typography variant="body2">{item.name || "Товар"}</Typography>
                        </div>
                        <div className="modal-product-qty">x{quantity}</div>
                        <div className="modal-product-total">{formatPrice(itemTotal)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`modal-section-card comment-card ${selectedOrderForModal.comment ? "has-comment" : ""}`}>
                <div className="section-header">
                  <CommentOutlined className="section-icon" />
                  <span className="section-label">Коментар клієнта</span>
                </div>
                <Typography variant="body2">
                  {selectedOrderForModal.comment || "Коментар відсутній"}
                </Typography>
              </div>

              {selectedOrderForModal.history && selectedOrderForModal.history.length > 0 && (
                <div className="modal-section-card history-card">
                  <div className="section-header">
                    <HistoryIcon className="section-icon" />
                    <span className="section-label">Історія статусів</span>
                  </div>
                  <div className="history-list">
                    {[...selectedOrderForModal.history]
                      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                      .map((entry, idx) => {
                        const isCurrent = entry.status === selectedOrderForModal.status;
                        return (
                          <div
                            key={idx}
                            className={`history-item ${isCurrent ? "is-current" : ""}`}
                          >
                            <span className="history-status">
                              {statusLabelMap[entry.status] || entry.status}
                            </span>
                            <span className="history-divider">—</span>
                            <span className="history-timestamp">
                              {formatOrderDate(entry.timestamp)} · {formatOrderTime(entry.timestamp)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
          <Box className="modal-quick-actions">
            {selectedOrderForModal && !terminalStatuses.has(selectedOrderForModal.status) && (
              <>
                <Button
                  onClick={() => handleStatusChangeAttempt(selectedOrderForModal, "cancelled")}
                  variant="outlined"
                  color="error"
                  disabled={isUpdating === selectedOrderForModal._id}
                  sx={{ mr: 1 }}
                >
                  Скасувати
                </Button>
                {selectedOrderForModal.status === "new" && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrderForModal._id, "confirmed")}
                    variant="contained"
                    color="success"
                    disabled={isUpdating === selectedOrderForModal._id}
                  >
                    Підтвердити
                  </Button>
                )}
                {selectedOrderForModal.status === "confirmed" && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrderForModal._id, "packing")}
                    variant="contained"
                    color="primary"
                    disabled={isUpdating === selectedOrderForModal._id}
                  >
                    Почати комплектування
                  </Button>
                )}
                {selectedOrderForModal.status === "packing" && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrderForModal._id, "ready_for_pickup")}
                    variant="contained"
                    color="secondary"
                    disabled={isUpdating === selectedOrderForModal._id}
                  >
                    Передати в доставку
                  </Button>
                )}
                {selectedOrderForModal.status === "ready_for_pickup" && (
                  <Button
                    onClick={() => handleStatusChange(selectedOrderForModal._id, "received")}
                    variant="contained"
                    color="success"
                    disabled={isUpdating === selectedOrderForModal._id}
                  >
                    Позначити як отримано
                  </Button>
                )}
              </>
            )}
          </Box>
          <Button
            onClick={() => setSelectedOrderForModal(null)}
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.15)",
              color: "var(--text-primary)",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.05)",
              }
            }}
          >
            Закрити
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmModal
        isOpen={cancelConfirmation.isOpen}
        onClose={() => setCancelConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          handleStatusChange(cancelConfirmation.orderId, "cancelled");
          setCancelConfirmation(prev => ({ ...prev, isOpen: false }));
        }}
        icon={ReportProblemOutlined}
        title="Скасування замовлення"
        message={`Ви впевнені, що хочете скасувати замовлення ${cancelConfirmation.orderNumber}?`}
        warning="Цю дію не можна скасувати!"
        confirmText="Скасувати замовлення"
        cancelText="Не скасовувати"
        type="danger"
      />
    </Box>
  );
};

export default OrderListPage;
