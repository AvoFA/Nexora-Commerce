import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getCustomers,
  getCustomerStats,
  getCustomerDetails,
  toggleCustomerBlock
} from "../../../../services/customerService";

export const useAdminCustomers = (token) => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newToday: 0,
    activeBuyers: 0,
    loyalCustomers: 0
  });
  const [pagination, setPagination] = useState({
    totalCustomers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // "", "active", "blocked"
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setIsStatsLoading(true);
    try {
      const data = await getCustomerStats(token);
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Помилка завантаження статистики клієнтів:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [token]);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getCustomers(token, {
        page,
        limit,
        search,
        status,
        sortBy,
        sortOrder
      });
      if (data.success) {
        setCustomers(data.customers);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error(err.message || "Помилка завантаження списку клієнтів");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, limit, search, status, sortBy, sortOrder]);

  const handleRefresh = useCallback(() => {
    fetchStats();
    fetchCustomers();
  }, [fetchStats, fetchCustomers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleBlock = async (id) => {
    if (!token) return;
    setIsActionLoading(true);
    try {
      const data = await toggleCustomerBlock(id, token);
      if (data.success) {
        toast.success(data.message);
        // Refresh details if currently open
        if (selectedCustomer && selectedCustomer._id === id) {
          setSelectedCustomer(prev => ({ ...prev, status: data.status }));
        }
        // Refresh customer list and stats
        fetchCustomers();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Помилка оновлення статусу блокування");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    if (!token) return;
    setIsDetailsLoading(true);
    try {
      const data = await getCustomerDetails(id, token);
      if (data.success) {
        setSelectedCustomer(data.customer);
        setCustomerOrders(data.orders);
      }
    } catch (err) {
      toast.error(err.message || "Помилка завантаження детальної інформації");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  return {
    customers,
    stats,
    pagination,
    isLoading,
    isStatsLoading,
    selectedCustomer,
    customerOrders,
    isDetailsLoading,
    isActionLoading,
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    limit,
    setPage,
    setLimit,
    handleRefresh,
    handleToggleBlock,
    handleViewDetails,
    handleCloseDetails
  };
};
