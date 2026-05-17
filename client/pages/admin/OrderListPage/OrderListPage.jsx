import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Select, MenuItem, FormControl } from '@mui/material';
import { toast } from 'sonner';
import { getAdminOrders, updateOrderStatus } from '../../../services/orderService';

import '../../../styles/_common.scss';
import '../../../styles/_mui-theme.scss';
import '../../../styles/_admin.scss';
import './OrderListPage.scss';

const statusColorMap = {
  new: 'info',
  confirmed: 'primary',
  packing: 'warning',
  ready_for_pickup: 'secondary',
  received: 'success',
  cancelled: 'error'
};

const statusLabelMap = {
  new: 'Нове',
  confirmed: 'Підтверджено',
  packing: 'Комплектується',
  ready_for_pickup: 'Готово до видачі',
  received: 'Отримано',
  cancelled: 'Скасовано'
};

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Токен відсутній. Увійдіть в систему.');
        return;
      }
      const data = await getAdminOrders(token);
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error(error.message || 'Помилка завантаження замовлень');
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
      const token = localStorage.getItem('adminToken');
      const data = await updateOrderStatus(id, newStatus, token);
      if (data.success) {
        toast.success(data.message || 'Статус замовлення оновлено');
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      toast.error(error.message || 'Помилка оновлення статусу');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Box className="order-list-page">
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">Керування замовленнями</Typography>
          <Typography variant="body2" className="subtitle">Управління статусами замовлень клієнтів</Typography>
        </div>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
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
                <TableCell>Дата</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>Немає замовлень</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        #{order._id.slice(-6).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{order.customer?.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{order.customer?.email}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.customer?.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      {order.items?.map((item, index) => (
                        <Typography key={index} variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.quantity}x {item.name}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{order.totalPrice} ₴</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusLabelMap[order.status] || order.status} 
                        color={statusColorMap[order.status] || 'default'} 
                        size="small" 
                        variant={order.status === 'new' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={isUpdating === order._id || order.status === 'cancelled' || order.status === 'received'}
                          className="status-select"
                        >
                          {Object.entries(statusLabelMap).map(([key, label]) => (
                            <MenuItem key={key} value={key} disabled={
                              (order.status === 'new' && (key === 'ready_for_pickup' || key === 'received')) ||
                              (order.status === 'cancelled') ||
                              (order.status === 'received')
                            }>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default OrderListPage;
