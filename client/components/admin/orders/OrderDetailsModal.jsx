import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonOutline,
  LocalShippingOutlined,
  PaymentOutlined,
  CommentOutlined,
  History as HistoryIcon,
} from "@mui/icons-material";
import { formatPrice } from "../../../utils/formatPrice";
import {
  statusColorMap,
  statusLabelMap,
  terminalStatuses,
  getOrderNumber,
  formatOrderDate,
  formatOrderTime,
  getOrderTotal,
  getDeliveryAddress,
  getItemKey,
  renderProductThumb,
  getHistoryStatusLabel,
} from "./order.helpers";

const OrderDetailsModal = ({
  order,
  open,
  onClose,
  isUpdating,
  onStatusChange,
  onStatusChangeAttempt,
}) => {
  if (!order) return null;

  const totalQuantity = (order.items || []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0,
  );

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
    <Dialog
      open={open}
      onClose={onClose}
      className="order-detail-dialog"
      maxWidth="md"
      fullWidth
    >
      <button
        onClick={onClose}
        className="admin-modal-close-btn"
        aria-label="закрити"
        type="button"
      >
        <CloseIcon />
      </button>
      <DialogTitle sx={{ p: 0 }}>
        <Box className="modal-header-compact">
          <div className="modal-header-main">
            <div className="modal-header-title-row">
              <Typography variant="h3" className="modal-title-text">
                {getOrderNumber(order)}
              </Typography>
              <div className="modal-header-status-wrapper">
                {renderStatusChip(order.status)}
              </div>
            </div>
            <div className="modal-header-created-row">
              <span className="modal-created-label">Створено: </span>
              <span className="modal-date">
                {formatOrderDate(order.createdAt)} ·{" "}
                {formatOrderTime(order.createdAt)}
              </span>
              {terminalStatuses.has(order.status) && (
                <>
                  <span className="modal-subtitle-divider">·</span>
                  <span className="terminal-note">Фінальний статус</span>
                </>
              )}
            </div>
          </div>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box className="order-modal-content">
          <Box className="modal-info-grid">
            <div className="modal-section-card">
              <div className="section-header">
                <PersonOutline className="section-icon" />
                <span className="section-label">Клієнт</span>
              </div>
              <Typography variant="body2" className="section-title">
                {order.customer?.name || "—"}
              </Typography>
              <span>{order.customer?.email || "—"}</span>
              <span className="customer-phone">{order.customer?.phone || "—"}</span>
            </div>

            <div className="modal-section-card">
              <div className="section-header">
                <LocalShippingOutlined className="section-icon" />
                <span className="section-label">Доставка</span>
              </div>
              <Typography variant="body2" className="section-title">
                {getDeliveryAddress(order.delivery)}
              </Typography>
              <span>
                {order.delivery?.type || "Адресна доставка"}
              </span>
              {order.delivery?.plannedDate && (
                <span>
                  Планова дата: {order.delivery.plannedDate}
                </span>
              )}
            </div>

            <div className="modal-section-card">
              <div className="section-header">
                <PaymentOutlined className="section-icon" />
                <span className="section-label">Оплата</span>
              </div>
              <Typography variant="body2" className="section-title">
                {order.paymentMethod === "card"
                  ? "Карткою онлайн"
                  : "Оплата при отриманні"}
              </Typography>
              <span>
                Разом: {formatPrice(getOrderTotal(order))}
              </span>
            </div>
          </Box>

          <div className="modal-products-section">
            <div className="products-section-header">
              <span className="section-label">Товари</span>
              <div className="products-summary-badge">
                <span className="summary-qty">
                  {totalQuantity} поз.
                </span>
                <span className="summary-divider">·</span>
                <span className="summary-total">
                  {formatPrice(getOrderTotal(order))}
                </span>
              </div>
            </div>
            <div className="modal-products-list">
              {(order.items || []).map((item, index) => {
                const quantity = Number(item.quantity) || 1;
                const itemTotal = (Number(item.price) || 0) * quantity;

                return (
                  <div
                    className="modal-product-row"
                    key={getItemKey(order, item, index)}
                  >
                    <div className="modal-product-image">
                      {renderProductThumb(item)}
                    </div>
                    <div className="modal-product-copy">
                      <Typography variant="body2" title={item.name || "Товар"}>
                        {item.name || "Товар"}
                      </Typography>
                      <span className="product-unit-price">
                        {formatPrice(Number(item.price) || 0)} за шт.
                      </span>
                    </div>
                    <div className="modal-product-qty">x{quantity}</div>
                    <div className="modal-product-total">
                      {formatPrice(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`modal-section-card comment-card ${order.comment ? "has-comment" : ""}`}
          >
            <div className="section-header">
              <CommentOutlined className="section-icon" />
              <span className="section-label">Коментар клієнта</span>
            </div>
            <Typography variant="body2">
              {order.comment || "Коментар відсутній"}
            </Typography>
          </div>

          {order.status === "cancelled" && order.cancellation && (
            <div className="modal-section-card cancellation-card" style={{ borderLeft: '3px solid #f44336' }}>
              <div className="section-header" style={{ color: '#f44336' }}>
                <CloseIcon className="section-icon" />
                <span className="section-label">Дані про скасування</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <Typography variant="body2">
                  <strong>Ким:</strong> {order.cancellation.cancelledBy === 'customer' ? 'Клієнт' : 'Адміністратор'}
                </Typography>
                {order.cancellation.reason && (
                  <Typography variant="body2">
                    <strong>Причина:</strong> {order.cancellation.reason}
                  </Typography>
                )}
                {order.cancellation.comment && (
                  <Typography variant="body2">
                    <strong>Коментар:</strong> {order.cancellation.comment}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, fontSize: '13px' }}>
                  <strong>Дата:</strong> {order.cancellation.cancelledAt ? `${formatOrderDate(order.cancellation.cancelledAt)} · ${formatOrderTime(order.cancellation.cancelledAt)}` : '—'}
                </Typography>
              </div>
            </div>
          )}

          {order.history && order.history.length > 0 && (
            <div className="modal-section-card history-card">
              <div className="section-header">
                <HistoryIcon className="section-icon" />
                <span className="section-label">Історія статусів</span>
              </div>
              <div className="history-list">
                {[...order.history]
                  .sort(
                    (a, b) =>
                      new Date(a.timestamp) - new Date(b.timestamp),
                  )
                  .map((entry, idx) => {
                    const isCurrent = entry.status === order.status;
                    return (
                      <div
                        key={idx}
                        className={`history-item ${isCurrent ? "is-current" : ""}`}
                      >
                        <span className="history-status">
                          {getHistoryStatusLabel(entry)}
                        </span>
                        <span className="history-divider">—</span>
                        <span className="history-timestamp">
                          {formatOrderDate(entry.timestamp)} ·{" "}
                          {formatOrderTime(entry.timestamp)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", px: 3, py: 2, position: "relative" }}>
        <Box className="modal-quick-actions">
          {!terminalStatuses.has(order.status) && (
            <>
              <Button
                onClick={() => onStatusChangeAttempt(order, "cancelled")}
                variant="outlined"
                color="error"
                disabled={isUpdating}
              >
                Скасувати
              </Button>
              {order.status === "new" && (
                <Button
                  onClick={() => onStatusChange(order._id, "confirmed")}
                  variant="contained"
                  color="success"
                  disabled={isUpdating}
                >
                  Підтвердити
                </Button>
              )}
              {order.status === "confirmed" && (
                <Button
                  onClick={() => onStatusChange(order._id, "packing")}
                  variant="contained"
                  color="primary"
                  disabled={isUpdating}
                >
                  Почати комплектування
                </Button>
              )}
              {order.status === "packing" && (
                <Button
                  onClick={() => onStatusChange(order._id, "ready_for_pickup")}
                  variant="contained"
                  color="secondary"
                  disabled={isUpdating}
                >
                  Передати в доставку
                </Button>
              )}
              {order.status === "ready_for_pickup" && (
                <Button
                  onClick={() => onStatusChange(order._id, "received")}
                  variant="contained"
                  color="success"
                  disabled={isUpdating}
                >
                  Позначити як отримано
                </Button>
              )}
            </>
          )}
        </Box>
        <Button
          onClick={onClose}
          variant="outlined"
          className="close-modal-footer-btn"
          sx={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "var(--text-primary)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.05)",
            },
          }}
        >
          Закрити
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsModal;
