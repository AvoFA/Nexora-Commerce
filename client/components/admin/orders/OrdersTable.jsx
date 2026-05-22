import React from "react";
import {
  Avatar,
  Box,
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
  VisibilityOutlined,
  CreditCardOutlined,
  PaymentsOutlined,
} from "@mui/icons-material";
import { formatPrice } from "../../../utils/formatPrice";
import { formatCustomerName } from "../../../utils/customerFormatters";
import Pagination from "../../../components/common/Pagination/Pagination";
import OrderStatusDropdown from "./OrderStatusDropdown";
import {
  terminalStatuses,
  getOrderNumber,
  highlightMatch,
  formatOrderDate,
  formatOrderTime,
  getOrderTotal,
  getItemKey,
  renderProductThumb,
  IS_TEST_MODE,
  getCancellationSourceLabel,
} from "./order.helpers";

const OrdersTable = ({
  orders,
  searchQuery,
  isUpdating,
  activeDropdownOrderId,
  setActiveDropdownOrderId,
  onStatusChangeAttempt,
  onViewDetails,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
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
              <Avatar className="product-thumb" variant="rounded">
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
            <span className="products-extra-text">+{extraCount} ще</span>
          )}
        </div>
      </Box>
    );
  };

  return (
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
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                Немає замовлень
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order._id}
                className={
                  terminalStatuses.has(order.status)
                    ? "terminal-order-row"
                    : ""
                }
              >
                <TableCell>
                  <Box className="order-number-cell">
                    <Typography variant="body2" className="order-number">
                      {highlightMatch(getOrderNumber(order), searchQuery)}
                    </Typography>
                    <Typography variant="caption" className="order-date">
                      {formatOrderDate(order.createdAt)}
                    </Typography>
                    <Typography variant="caption" className="order-time">
                      {formatOrderTime(order.createdAt)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box className="customer-cell">
                    <Typography variant="body2" className="customer-name">
                      {highlightMatch(
                        formatCustomerName(order.user && order.user.surname !== undefined ? order.user : order.customer, 'compact'),
                        searchQuery,
                      )}
                    </Typography>
                    {order.customer?.email && (
                      <Typography
                        variant="caption"
                        className="customer-email"
                      >
                        {highlightMatch(order.customer.email, searchQuery)}
                      </Typography>
                    )}
                    {order.customer?.phone && (
                      <Typography
                        variant="caption"
                        className="customer-phone"
                      >
                        {highlightMatch(order.customer.phone, searchQuery)}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{renderProductsPreview(order)}</TableCell>
                <TableCell>
                  <Box className="total-cell">
                    <Typography variant="body2" className="total-value">
                      {formatPrice(getOrderTotal(order))}
                    </Typography>
                    <div className="total-meta-row">
                      <span className={`payment-badge-creative ${order.paymentMethod === 'card' ? 'payment-card' : 'payment-cash'}`}>
                        {order.paymentMethod === "card" ? (
                          <>
                            <CreditCardOutlined className="payment-icon" />
                            <span className="payment-text">Онлайн</span>
                          </>
                        ) : (
                          <>
                            <PaymentsOutlined className="payment-icon" />
                            <span className="payment-text">При отриманні</span>
                          </>
                        )}
                      </span>
                    </div>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box className="status-cell">
                    <OrderStatusDropdown
                      status={order.status}
                      onChange={(newStatus) =>
                        onStatusChangeAttempt(order, newStatus)
                      }
                      disabled={
                        isUpdating === order._id ||
                        (IS_TEST_MODE
                          ? false
                          : order.status === "cancelled" ||
                            order.status === "received")
                      }
                      isUpdating={isUpdating === order._id}
                      isOpen={activeDropdownOrderId === order._id}
                      onToggle={(isOpen) =>
                        setActiveDropdownOrderId(isOpen ? order._id : null)
                      }
                    />
                    {getCancellationSourceLabel(order) && (
                      <span className="cancellation-source-badge">
                        {getCancellationSourceLabel(order)}
                      </span>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box className="actions-cell">
                    <Tooltip title="Деталі замовлення">
                      <IconButton
                        size="small"
                        className="view-order-btn"
                        onClick={() => onViewDetails(order)}
                      >
                        <VisibilityOutlined />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          isLoading={isLoading}
          itemLabel="замовлень"
        />
      )}
    </TableContainer>
  );
};

export default OrdersTable;
