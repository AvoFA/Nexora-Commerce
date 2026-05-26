import { useState, useEffect, useCallback } from 'react';
import { getAdminDashboardData } from '../../../../services/orderService';
import { getAnyAuthToken } from '../../../../utils/authStorage';

export const useDashboardData = ({ enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = getAnyAuthToken();
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
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    fetchDashboardData();
  }, [enabled, fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboardData
  };
};
