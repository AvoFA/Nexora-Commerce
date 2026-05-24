import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonOutline as PersonIcon,
  MailOutline as MailIcon,
  PhoneOutlined as PhoneIcon,
  CalendarTodayOutlined as DateIcon,
  ShoppingBagOutlined as OrdersIcon,
  MonetizationOnOutlined as SpentIcon,
  SpeedOutlined as AvgIcon,
  Block as BlockIcon,
  CheckCircleOutline as ActiveIcon
} from "@mui/icons-material";
import { formatPrice } from "../../../../utils/formatPrice";
import { formatCustomerName, formatDate } from "../../../../utils/customerFormatters";


const orderStatusLabels = {
  new: "Нове",
  processing: "В обробці",
  confirmed: "В обробці",
  packing: "В обробці",
  ready_for_pickup: "Відправлено",
  received: "Отримано",
  cancelled: "Скасовано"
};

const orderStatusColors = {
  new: "status-new",
  processing: "status-processing",
  confirmed: "status-processing",
  packing: "status-processing",
  ready_for_pickup: "status-pickup",
  received: "status-received",
  cancelled: "status-cancelled"
};

const CustomerDetailsModal = ({
  customer,
  orders = [],
  open,
  onClose,
  onToggleBlock,
  isActionLoading
}) => {
  if (!customer) return null;

  const isBlocked = customer.status === "blocked";
  const fullName = formatCustomerName(customer, 'full');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="customer-details-dialog"
      maxWidth="md"
      fullWidth
    >
      {/* Modal Close Button */}
      <button
        onClick={onClose}
        className="admin-modal-close-btn"
        aria-label="закрити"
        type="button"
      >
        <CloseIcon />
      </button>

      <DialogTitle sx={{ p: 0 }}>
        <Box className="modal-header-compact customer-modal-header">
          <div className="modal-header-main">
            <div className="modal-header-title-row align-center">
              <Typography variant="h3" className="modal-title-text font-bold">
                {fullName}
              </Typography>
              <div className="modal-header-status-wrapper" style={{display: "inline-flex", alignItems: "center", gap: "12px" }}>
                <span className="customer-status-indicator">
                  <span className={`status-dot ${isBlocked ? "is-blocked" : "is-active"}`}></span>
                  <span className={`status-text ${isBlocked ? "is-blocked" : "is-active"}`}>
                    {isBlocked ? "Заблокований" : "Активний"}
                  </span>
                </span>
                <Button
                  variant="outlined"
                  color={isBlocked ? "success" : "error"}
                  size="small"
                  onClick={() => onToggleBlock(customer._id)}
                  disabled={isActionLoading}
                  startIcon={isBlocked ? <ActiveIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "6px",
                    px: 1.5,
                    py: "2px",
                    fontSize: "0.75rem",
                    minHeight: "24px",
                    lineHeight: 1.2,
                    borderColor: isBlocked ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
                    color: isBlocked ? "#10b981" : "#ef4444",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: isBlocked ? "#10b981" : "#ef4444",
                      backgroundColor: isBlocked ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                    }
                  }}
                >
                  {isBlocked ? "Розблокувати" : "Заблокувати"}
                </Button>
              </div>
            </div>
            <div className="modal-header-created-row text-xs text-secondary mt-1">
              <span>Зареєстрований: {formatDate(customer.createdAt, true)}</span>
            </div>
          </div>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }} className="customer-modal-content">
        {/* Customer Information Cards Grid */}
        <Box className="modal-info-grid customer-stats-grid mb-6">
          {/* Card 1: Contacts */}
          <div className="modal-section-card customer-section-card">
            <div className="section-header">
              <PersonIcon className="section-icon" />
              <span className="section-label">Контакти</span>
            </div>
            <div className="section-content mt-2">
              <div className="info-row">
                <MailIcon fontSize="small" className="row-icon text-secondary" />
                <span className="info-value">{customer.email || "—"}</span>
              </div>
              {customer.phone && (
                <div className="info-row mt-1">
                  <PhoneIcon fontSize="small" className="row-icon text-secondary" />
                  <span className="info-value">{customer.phone}</span>
                </div>
              )}
              <div className="info-row mt-1">
                <DateIcon fontSize="small" className="row-icon text-secondary" />
                <span className="info-value">Реєстрація: {formatDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Financial Stats */}
          <div className="modal-section-card customer-section-card">
            <div className="section-header">
              <SpentIcon className="section-icon" />
              <span className="section-label">Фінанси</span>
            </div>
            <div className="section-content mt-2">
              <div className="info-row">
                <OrdersIcon fontSize="small" className="row-icon text-secondary" />
                <span className="info-label">Замовлень:</span>
                <span className="info-value font-semibold ml-auto">{customer.ordersCount || 0}</span>
              </div>
              <div className="info-row mt-1">
                <SpentIcon fontSize="small" className="row-icon text-secondary" />
                <span className="info-label">Витрачено всього:</span>
                <span className="info-value font-bold text-primary ml-auto">{formatPrice(customer.totalSpent || 0)}</span>
              </div>
              <div className="info-row mt-1">
                <AvgIcon fontSize="small" className="row-icon text-secondary" />
                <span className="info-label">Середній чек:</span>
                <span className="info-value font-semibold ml-auto">{formatPrice(customer.avgCheck || 0)}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Activity */}
          <div className="modal-section-card customer-section-card">
            <div className="section-header">
              <AvgIcon className="section-icon" />
              <span className="section-label">Активність</span>
            </div>
            <div className="section-content mt-2">
              <div className="info-row">
                <span className="info-label">Остання покупка:</span>
                <span className="info-value ml-auto font-medium">
                  {formatDate(customer.lastOrderDate)}
                </span>
              </div>
              <div className="info-row mt-1">
                <span className="info-label">Статус акаунту:</span>
                <span className={`info-value ml-auto font-semibold ${isBlocked ? "text-danger" : "text-success"}`}>
                  {isBlocked ? "Блокований" : "Активний"}
                </span>
              </div>
            </div>
          </div>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Client's Orders Table */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" className="section-subtitle font-bold" sx={{ mb: 0 }}>
            Останні замовлення {orders.length > 0 && `(${orders.length > 5 ? '5+' : orders.length})`}
          </Typography>
          {orders.length > 0 && (
            <Link
              to={`/admin/orders?customer=${customer._id}&customerName=${encodeURIComponent(formatCustomerName(customer, 'compact') || customer.email || "")}&status=all`}
              style={{ textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-color)' }}
              onClick={onClose}
              className="hover-underline"
            >
              Переглянути всі замовлення клієнта &rarr;
            </Link>
          )}
        </Box>

        {orders.length === 0 ? (
          <Box sx={{ py: 4, textCenter: "center", display: "flex", justifyContent: "center" }}>
            <span className="no-data-text text-secondary">У цього клієнта ще немає замовлень</span>
          </Box>
        ) : (
          <TableContainer component={Paper} className="admin-table-container modal-orders-table-container">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Замовлення</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Сума</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.slice(0, 5).map((order) => {
                  const statusClass = orderStatusColors[order.status] || "status-new";
                  const orderNum = order.orderNumber || order._id.toString().substring(0, 8).toUpperCase();
                  return (
                    <TableRow key={order._id} hover>
                      <TableCell className="font-semibold">{orderNum}</TableCell>
                      <TableCell className="text-secondary">{formatDate(order.createdAt, true)}</TableCell>
                      <TableCell className="font-bold">{formatPrice(order.totalPrice || 0)}</TableCell>
                      <TableCell>
                        <span className={`order-status-badge ${statusClass}`}>
                          {orderStatusLabels[order.status] || order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
