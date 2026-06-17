import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import AdminSearchInput from '../../../components/admin/common/AdminSearchInput.jsx';

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
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const activeSubTab = searchParams.get('subTab') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const page = parseInt(searchParams.get('page'), 10) || 1;
  const limit = parseInt(searchParams.get('limit'), 10) || 15;

  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const result = await getActivityLogs({
        actionType: activeTab,
        targetModel: activeTab === 'moderation' ? activeSubTab : 'all',
        search: searchQuery,
        startDate,
        endDate,
        page,
        limit
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

  // Синхронізація локального інпуту пошуку з URL параметром
  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  // Дебаунс синхронізація пошукового запиту
  useEffect(() => {
    if (localSearchInput === searchQuery) return;

    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          if (!localSearchInput.trim()) {
            prev.delete('q');
          } else {
            prev.set('q', localSearchInput.trim());
          }
          prev.delete('page'); // Скидання сторінки на 1 при пошуку
          return prev;
        },
        { replace: true }
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearchInput, searchQuery, setSearchParams]);

  useEffect(() => {
    fetchLogs();
  }, [page, activeTab, activeSubTab, limit, searchQuery, startDate, endDate]);

  const handleTabChange = (tabValue) => {
    setSearchParams(
      (prev) => {
        if (tabValue === 'all') {
          prev.delete('tab');
        } else {
          prev.set('tab', tabValue);
        }
        prev.delete('subTab');
        prev.delete('page');
        return prev;
      },
      { replace: true }
    );
  };

  const handleSubTabChange = (subTabValue) => {
    setSearchParams(
      (prev) => {
        if (subTabValue === 'all') {
          prev.delete('subTab');
        } else {
          prev.set('subTab', subTabValue);
        }
        prev.delete('page');
        return prev;
      },
      { replace: true }
    );
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handlePageChange = (newPage) => {
    setSearchParams(
      (prev) => {
        prev.set('page', newPage);
        return prev;
      },
      { replace: true }
    );
  };

  const handleLimitChange = (newLimit) => {
    setSearchParams(
      (prev) => {
        prev.set('limit', newLimit);
        prev.delete('page');
        return prev;
      },
      { replace: true }
    );
  };

  const handleDateChange = (type, value) => {
    setSearchParams(
      (prev) => {
        if (!value) {
          prev.delete(type);
        } else {
          prev.set(type, value);
        }
        prev.delete('page');
        return prev;
      },
      { replace: true }
    );
  };

  const handleClearDates = () => {
    setSearchParams(
      (prev) => {
        prev.delete('startDate');
        prev.delete('endDate');
        prev.delete('page');
        return prev;
      },
      { replace: true }
    );
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

      <div className="admin-solid-card moderation-toolbar-card log-toolbar-card">
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
            <div className="toolbar-divider log-divider" />
            <div className="toolbar-header-row row-start">
              <div className="moderation-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${activeSubTab === 'all' ? 'active' : ''}`}
                  onClick={() => handleSubTabChange('all')}
                >
                  Всі події
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${activeSubTab === 'Review' ? 'active' : ''}`}
                  onClick={() => handleSubTabChange('Review')}
                >
                  Відгуки
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${activeSubTab === 'Question' ? 'active' : ''}`}
                  onClick={() => handleSubTabChange('Question')}
                >
                  Питання
                </button>
              </div>
            </div>
          </>
        )}

        <div className="toolbar-divider log-divider" />

        <div className="review-filters-toolbar log-filters-toolbar">
          <AdminSearchInput
            value={localSearchInput}
            onChange={setLocalSearchInput}
            onClear={() => setLocalSearchInput('')}
            placeholder={
              activeTab === 'all'
                ? 'Пошук за дією, адміністратором, товаром чи замовленням...'
                : activeTab === 'orders'
                ? 'Пошук за ID замовлення, сумою чи email...'
                : activeTab === 'products'
                ? 'Пошук за назвою товару, артикулом чи email...'
                : activeTab === 'moderation'
                ? 'Пошук за текстом відгуку, питання чи email...'
                : activeTab === 'auth'
                ? 'Пошук за IP, типом входу чи email...'
                : 'Пошук за журналом дій...'
            }
            disabled={isLoading}
          />

          <div className="toolbar-selects log-date-filters">
            <div className="date-input-group">
              <span className="date-label">З:</span>
              <input
                type="date"
                className="admin-date-picker"
                value={startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="date-input-group">
              <span className="date-label">По:</span>
              <input
                type="date"
                className="admin-date-picker"
                value={endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                disabled={isLoading}
              />
            </div>

            {(startDate || endDate) && (
              <button
                type="button"
                className="clear-dates-btn"
                onClick={handleClearDates}
                disabled={isLoading}
              >
                Очистити період
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-solid-card log-timeline-card-wrapper">
        {isLoading ? (
          <div className="log-loading-container">
            <CircularProgress size={40} className="spinner" />
            <p style={{ marginTop: '16px' }}>Завантаження журналу дій...</p>
          </div>
        ) : (
          <>
            <LogTimeline logs={logs} onOrderClick={handleOrderClick} searchQuery={searchQuery} />
            
            {totalPages > 1 && (
              <div className="log-pagination-wrapper">
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
