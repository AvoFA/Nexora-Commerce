import React, { useEffect, useState } from "react";
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
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
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
} from "@mui/icons-material";
import { toast } from "sonner";
import { getAdminOrders, updateOrderStatus } from "../../../services/orderService";
import { formatPrice } from "../../../utils/formatPrice";

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

const terminalStatuses = new Set(["received", "cancelled"]);

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

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [activeFilter, setActiveFilter] = useState("new");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
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
          prev.map((order) => (order._id === id ? { ...order, status: newStatus } : order)),
        );
        setSelectedOrderForModal((current) =>
          current?._id === id ? { ...current, status: newStatus } : current,
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
    const hiddenCount = Math.max(items.length - previewItems.length, 0);

    return (
      <Box className="products-preview">
        <div className="products-thumb-stack">
          {previewItems.map((item, index) => (
            <Avatar
              key={getItemKey(order, item, index)}
              className="product-thumb"
              variant="rounded"
            >
              {renderProductThumb(item)}
            </Avatar>
          ))}
          {hiddenCount > 0 && <span className="products-extra">+{hiddenCount}</span>}
        </div>
        <div className="products-preview-copy">
          <Typography variant="body2" className="products-main">
            {items[0]?.name || "Товари не вказані"}
          </Typography>
          <div className="products-chip-row">
            <span>{items.length} товарів</span>
            {hiddenCount > 0 && <span>+{hiddenCount} ще</span>}
          </div>
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

      <div className="admin-solid-card filter-card">
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

        <Box className="orders-stats-overview">
          <div className="stat-item new">
            <span className="stat-label">Нових замовлень</span>
            <span className="stat-value">{overviewStats.new}</span>
          </div>
          <div className="stat-item shipped">
            <span className="stat-label">Відправлено</span>
            <span className="stat-value">{overviewStats.shipped}</span>
          </div>
          <div className="stat-item cancelled">
            <span className="stat-label">Скасовано</span>
            <span className="stat-value">{overviewStats.cancelled}</span>
          </div>
          <div className="stat-item all">
            <span className="stat-label">Загальна кількість</span>
            <span className="stat-value">{overviewStats.all}</span>
          </div>
        </Box>
      </div>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="admin-table-container">
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
                        <Typography variant="caption" className="total-caption">
                          {order.items?.length || 0} позицій
                        </Typography>
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
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={order.status}
                            onChange={(event) => handleStatusChange(order._id, event.target.value)}
                            disabled={
                              isUpdating === order._id ||
                              order.status === "cancelled" ||
                              order.status === "received"
                            }
                            className="status-select"
                          >
                            {Object.entries(statusLabelMap).map(([key, label]) => (
                              <MenuItem
                                key={key}
                                value={key}
                                disabled={
                                  (order.status === "new" &&
                                    (key === "ready_for_pickup" || key === "received")) ||
                                  order.status === "cancelled" ||
                                  order.status === "received"
                                }
                              >
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
        <DialogTitle>Деталі замовлення</DialogTitle>
        <DialogContent dividers>
          {selectedOrderForModal && (
            <Box className="order-modal-content">
              <Box className="modal-summary-panel">
                <div>
                  <span className="modal-kicker">Замовлення</span>
                  <Typography variant="h3">{getOrderNumber(selectedOrderForModal)}</Typography>
                  <span className="modal-date">
                    {formatOrderDate(selectedOrderForModal.createdAt)} ·{" "}
                    {formatOrderTime(selectedOrderForModal.createdAt)}
                  </span>
                </div>
                <div className="modal-status-block">
                  {renderStatusChip(selectedOrderForModal.status)}
                  {terminalStatuses.has(selectedOrderForModal.status) && (
                    <span className="terminal-note">Фінальний статус</span>
                  )}
                </div>
              </Box>

              <Box className="modal-info-grid">
                <div className="modal-section-card">
                  <span className="section-label">Клієнт</span>
                  <Typography variant="body2" className="section-title">
                    {selectedOrderForModal.customer?.name || "—"}
                  </Typography>
                  <span>{selectedOrderForModal.customer?.email || "—"}</span>
                  <span>{selectedOrderForModal.customer?.phone || "—"}</span>
                </div>

                <div className="modal-section-card">
                  <span className="section-label">Доставка</span>
                  <Typography variant="body2" className="section-title">
                    {getDeliveryAddress(selectedOrderForModal.delivery)}
                  </Typography>
                  <span>{selectedOrderForModal.delivery?.type || "Адресна доставка"}</span>
                  {selectedOrderForModal.delivery?.plannedDate && (
                    <span>Планова дата: {selectedOrderForModal.delivery.plannedDate}</span>
                  )}
                </div>

                <div className="modal-section-card">
                  <span className="section-label">Оплата</span>
                  <Typography variant="body2" className="section-title">
                    {selectedOrderForModal.paymentMethod === "card"
                      ? "Карткою онлайн"
                      : "Оплата при отриманні"}
                  </Typography>
                  <span>Разом: {formatPrice(getOrderTotal(selectedOrderForModal))}</span>
                </div>
              </Box>

              <div className="modal-products-section">
                <span className="section-label">Товари</span>
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
                          <span>{formatPrice(Number(item.price) || 0)} за одиницю</span>
                        </div>
                        <div className="modal-product-qty">{quantity} шт.</div>
                        <div className="modal-product-total">{formatPrice(itemTotal)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-section-card comment-card">
                <span className="section-label">Коментар</span>
                <Typography variant="body2">
                  {selectedOrderForModal.comment || "Коментар відсутній"}
                </Typography>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSelectedOrderForModal(null)}
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.15)",
              color: "var(--text-primary)",
            }}
          >
            Закрити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderListPage;
