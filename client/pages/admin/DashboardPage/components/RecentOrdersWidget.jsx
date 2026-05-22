import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tooltip, IconButton } from '@mui/material';
import { VisibilityOutlined, ReceiptLong } from '@mui/icons-material';
import { formatPrice } from '../../../../utils/formatPrice';
import {
  getOrderNumber,
  formatOrderDate,
  formatOrderTime,
  getStatusBadgeClass,
  getStatusLabel,
} from '../../../../components/admin/orders/order.helpers';

const RecentOrdersWidget = ({ orders = [], onViewOrder }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bento-cell recent-orders-cell">
      <div className="widget-header">
        <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ReceiptLong fontSize="small" style={{ opacity: 0.8 }} />
          Останні замовлення
        </h3>
        <button
          className="widget-action-btn"
          onClick={() => navigate('/admin/orders?status=all')}
        >
          Всі замовлення
        </button>
      </div>

      <div className="widget-content" style={{ padding: 0 }}>
        {orders.length === 0 ? (
          <div className="widget-empty-state">
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Немає замовлень за останній час</p>
          </div>
        ) : (
          <div className="widget-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Клієнт</th>
                  <th>Дата</th>
                  <th>Сума</th>
                  <th>Статус</th>
                  <th className="actions-cell">Дії</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600 }}>
                      {getOrderNumber(order)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>
                          {order.customer?.name || order.shippingDetails?.fullName || order.user?.name || 'Гість'}
                        </span>
                        {(order.customer?.phone || order.shippingDetails?.phone) && (
                          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                            {order.customer?.phone || order.shippingDetails?.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{formatOrderDate(order.createdAt)}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                          {formatOrderTime(order.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td>
                      <span className={`widget-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Tooltip title="Деталі замовлення" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onViewOrder && onViewOrder(order)}
                          sx={{
                            color: 'var(--primary-color, #3b82f6)',
                            '&:hover': {
                              background: 'rgba(59, 130, 246, 0.1)'
                            }
                          }}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrdersWidget;
