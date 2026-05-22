import { useState, useEffect, useCallback } from 'react';
import { getAdminDashboardData } from '../../../../services/orderService';

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Не авторизовано');
      }
      const responseData = await getAdminDashboardData(token);
      if (responseData.success) {
        setData(responseData);
      } else {
        throw new Error(responseData.message || 'Помилка завантаження даних дашборду');
      }
    } catch (err) {
      console.error('Помилка завантаження дашборду:', err);
      setError(err.message || 'Помилка завантаження даних дашборду');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboardData
  };
};
