import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { toast } from 'sonner';
import { getActivityLogs } from '../../../services/activityLogService';
import { getAdminOrders } from '../../../services/orderService';
import { getAdminToken } from '../../../utils/authStorage';
import LogTimeline from './components/LogTimeline';
import OrderDetailsModal from '../../../components/admin/orders/OrderDetailsModal';
import AdminRefreshButton from '../../../components/admin/common/AdminRefreshButton';
import AdminFilterTabs from '../../../components/admin/common/AdminFilterTabs.jsx';
import Pagination from '../../../components/common/Pagination/Pagination.jsx';

import '../../../styles/_common.scss';
import '../../../styles/_mui-theme.scss';
import '../../../styles/_admin.scss';
import './ActivityLogPage.scss';

const logTabs = [
  { value: 'all', label: 'Всі події', countKey: 'all' },
  { value: 'orders', label: 'Замовлення', countKey: 'orders' },
  { value: 'products', label: 'Товари', countKey: 'products' },
  { value: 'moderation', label: 'Модерація', countKey: 'moderation' },
  { value: 'auth', label: 'Безпека', countKey: 'auth' }
];

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);

  const fetchLogs = async (currentPage = page, tab = activeTab, subTab = activeSubTab, currentLimit = limit) => {
    setIsLoading(true);
    try {
      const result = await getActivityLogs({
        actionType: tab,
        targetModel: tab === 'moderation' ? subTab : 'all',
        page: currentPage,
        limit: currentLimit
      });
      if (result.success) {
        setLogs(result.logs || []);
        setTotalPages(result.totalPages || 1);
        setTotal(result.total || 0);
        setCounts(result.counts || {});
      } else {
        toast.error('Не вдалося завантажити журнал дій', { id: 'activity-log-error' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Помилка при завантаженні журналу дій', { id: 'activity-log-error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, activeTab, activeSubTab, limit);
  }, [page, activeTab, activeSubTab, limit]);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setActiveSubTab('all');
    setPage(1);
  };

  const handleRefresh = () => {
    fetchLogs(page, activeTab, activeSubTab, limit);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleOrderClick = async (orderId) => {
    setIsFetchingOrder(true);
    try {
      const token = getAdminToken();
      const result = await getAdminOrders(token, { search: orderId });
      if (result.success && result.orders && result.orders.length > 0) {
        setSelectedOrder(result.orders[0]);
      } else {
        toast.error('Замовлення не знайдено в базі даних', { id: 'order-details-error' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Помилка при отриманні деталей замовлення', { id: 'order-details-error' });
    } finally {
      setIsFetchingOrder(false);
    }
  };

  return (
    <div className="review-list-page activity-log-page-wrapper">
      <div className="admin-page-header">
        <div className="header-title-wrapper">
          <h2>Журнал дій</h2>
          <p className="subtitle">
            Аудит дій адміністраторів та модераторів платформи
          </p>
        </div>
      </div>

      <div className="admin-solid-card moderation-toolbar-card" style={{ marginBottom: '16px', padding: '20px' }}>
        <div className="toolbar-header-row">
          <AdminFilterTabs
            activeTab={activeTab}
            onChange={handleTabChange}
            tabs={logTabs}
            ariaLabel="Тип логів"
          />
          <AdminRefreshButton onClick={handleRefresh} isLoading={isLoading} />
        </div>

        {activeTab === 'moderation' && (
          <>
            <div className="toolbar-divider" style={{ margin: '2px 0' }} />
            <div className="toolbar-header-row" style={{ justifyContent: 'flex-start' }}>
              <div className="moderation-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${activeSubTab === 'all' ? 'active' : ''}`}
                  onClick={() => { setActiveSubTab('all'); setPage(1); }}
                >
                  Всі події
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${activeSubTab === 'Review' ? 'active' : ''}`}
                  onClick={() => { setActiveSubTab('Review'); setPage(1); }}
                >
                  Відгуки
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${activeSubTab === 'Question' ? 'active' : ''}`}
                  onClick={() => { setActiveSubTab('Question'); setPage(1); }}
                >
                  Питання
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="admin-solid-card log-timeline-card-wrapper" style={{ padding: '24px' }}>
        {isLoading ? (
          <div className="log-loading-container">
            <CircularProgress size={40} className="spinner" />
            <p style={{ marginTop: '16px' }}>Завантаження журналу дій...</p>
          </div>
        ) : (
          <>
            <LogTimeline logs={logs} onOrderClick={handleOrderClick} />
            
            {totalPages > 1 && (
              <div style={{ marginTop: '24px' }}>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  isLoading={isLoading}
                  itemLabel="записів"
                />
              </div>
            )}
          </>
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        isUpdating={false}
        onStatusChange={() => {}}
        onStatusChangeAttempt={() => {}}
      />

      {isFetchingOrder && (
        <div className="order-details-loading-overlay">
          <CircularProgress size={50} />
          <p>Отримання інформації про замовлення...</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;
