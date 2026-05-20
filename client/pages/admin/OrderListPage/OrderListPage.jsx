import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { ReportProblemOutlined } from "@mui/icons-material";
import { toast } from "sonner";
import {
  getAdminOrders,
  updateOrderStatus,
} from "../../../services/orderService";

// Shared Presentational Controls
import AdminSearchInput from "../../../components/admin/common/AdminSearchInput";
import AdminRefreshButton from "../../../components/admin/common/AdminRefreshButton";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect.jsx";
import AdminFilterTabs from "../../../components/admin/common/AdminFilterTabs";

// Order Specific Presentational Components
import OrdersStats from "../../../components/admin/orders/OrdersStats";
import OrdersTable from "../../../components/admin/orders/OrdersTable";
import OrderDetailsModal from "../../../components/admin/orders/OrderDetailsModal";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";

// Helpers
import {
  getOrderNumber,
} from "../../../components/admin/orders/order.helpers";

import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./OrderListPage.scss";

const filterTabs = [
  { value: "new", label: "Нові" },
  { value: "processing", label: "В обробці" },
  { value: "ready_for_pickup", label: "Відправлено" },
  { value: "received", label: "Отримано" },
  { value: "cancelled", label: "Скасовано" },
  {
    value: "cancelled_customer",
    label: "Клієнтом",
    countKey: "cancelledCustomer",
    compact: true,
  },
  {
    value: "cancelled_admin",
    label: "Адміном",
    countKey: "cancelledAdmin",
    compact: true,
  },
  { value: "all", label: "Усі" },
];

const sortOptions = [
  { value: "createdAt_desc", label: "Спочатку нові" },
  { value: "createdAt_asc", label: "Спочатку старі" },
  { value: "totalPrice_desc", label: "Сума: від більшої" },
  { value: "totalPrice_asc", label: "Сума: від меншої" },
];

const getActiveFilterFromParams = (status, cancelledBy) => {
  if (status === "cancelled" && cancelledBy === "customer") {
    return "cancelled_customer";
  }
  if (status === "cancelled" && cancelledBy === "admin") {
    return "cancelled_admin";
  }

  return status || "new";
};

const applyFilterToParams = (params, filter) => {
  params.delete("cancelledBy");

  if (filter === "new") {
    params.delete("status");
    return;
  }

  if (filter === "cancelled_customer") {
    params.set("status", "cancelled");
    params.set("cancelledBy", "customer");
    return;
  }

  if (filter === "cancelled_admin") {
    params.set("status", "cancelled");
    params.set("cancelledBy", "admin");
    return;
  }

  params.set("status", filter);
};

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "new";
  const cancelledByParam = searchParams.get("cancelledBy") || "";
  const activeFilter = getActiveFilterFromParams(statusParam, cancelledByParam);
  const searchQuery = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "createdAt_desc";
  const [lastActiveTab, setLastActiveTab] = useState(null);

  const [serverCounts, setServerCounts] = useState({
    all: 0,
    new: 0,
    processing: 0,
    ready_for_pickup: 0,
    received: 0,
    cancelled: 0,
    cancelledCustomer: 0,
    cancelledAdmin: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = parseInt(searchParams.get("limit"), 10) || 20;

  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);

  // Sync local search input with URL search query parameter
  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  // Debounced effect to sync localSearchInput to URLSearchParams q
  useEffect(() => {
    if (localSearchInput === searchQuery) return;

    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          if (!localSearchInput.trim()) {
            prev.delete("q");
            if (lastActiveTab) {
              applyFilterToParams(prev, lastActiveTab);
            }
            setLastActiveTab(null);
          } else {
            if (!prev.get("q") && activeFilter !== "all") {
              setLastActiveTab(activeFilter);
              prev.set("status", "all");
              prev.delete("cancelledBy");
            }
            prev.set("q", localSearchInput.trim());
          }
          prev.delete("page"); // Reset page to 1 on search
          return prev;
        },
        { replace: true },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [
    localSearchInput,
    searchQuery,
    activeFilter,
    lastActiveTab,
    setSearchParams,
  ]);

  const handleFilterChange = (status) => {
    setSearchParams(
      (prev) => {
        applyFilterToParams(prev, status);
        prev.delete("q"); // Clear search when switching tabs manually
        prev.delete("page"); // Reset page to 1
        return prev;
      },
      { replace: true },
    );
    setLastActiveTab(null); // Clear saved tab
  };

  const handleSearchChange = (query) => {
    setLocalSearchInput(query);
  };

  const handleInstantSearchClear = () => {
    setLocalSearchInput("");
    setSearchParams(
      (prev) => {
        prev.delete("q");
        prev.delete("page");
        if (lastActiveTab) {
          applyFilterToParams(prev, lastActiveTab);
        }
        setLastActiveTab(null);
        return prev;
      },
      { replace: true },
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams(
      (prev) => {
        prev.set("page", newPage);
        return prev;
      },
      { replace: true },
    );
  };

  const handleLimitChange = (newLimit) => {
    setSearchParams(
      (prev) => {
        prev.set("limit", newLimit);
        prev.delete("page"); // Reset to page 1 on limit change
        return prev;
      },
      { replace: true },
    );
  };

  const handleSortChange = (newSort) => {
    setSearchParams(
      (prev) => {
        prev.set("sort", newSort);
        prev.delete("page"); // Reset page to 1 on sort change
        return prev;
      },
      { replace: true },
    );
  };

  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState(null);
  const [cancelConfirmation, setCancelConfirmation] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: "",
  });
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        toast.error("Токен відсутній. Увійдіть в систему.");
        return;
      }
      const data = await getAdminOrders(token, {
        page,
        limit,
        status: statusParam,
        cancelledBy: cancelledByParam,
        search: searchQuery,
        sort,
      });
      if (data.success) {
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
        if (data.counts) {
          setServerCounts(data.counts);
        }
      }
    } catch (error) {
      toast.error(error.message || "Помилка завантаження замовлень");
      const isTokenError =
        error.message &&
        (error.message.includes("токен") ||
          error.message.includes("Токен") ||
          error.message.includes("token") ||
          error.message.includes("Token") ||
          error.message.includes("auth") ||
          error.message.includes("Auth"));
      if (isTokenError) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusParam, cancelledByParam, searchQuery, page, limit, sort]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await updateOrderStatus(id, newStatus, token);
      if (data.success) {
        toast.success(data.message || "Статус замовлення оновлено");
        setSelectedOrderForModal((current) =>
          current?._id === id
            ? {
                ...current,
                status: newStatus,
                history: data.order?.history || current.history,
              }
            : current,
        );
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.message || "Помилка оновлення статусу");
      const isTokenError =
        error.message &&
        (error.message.includes("токен") ||
          error.message.includes("Токен") ||
          error.message.includes("token") ||
          error.message.includes("Token") ||
          error.message.includes("auth") ||
          error.message.includes("Auth"));
      if (isTokenError) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusChangeAttempt = (order, newStatus) => {
    if (newStatus === "cancelled") {
      setCancelConfirmation({
        isOpen: true,
        orderId: order._id,
        orderNumber: getOrderNumber(order),
      });
    } else {
      handleStatusChange(order._id, newStatus);
    }
  };

  return (
    <Box className="order-list-page">
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Керування замовленнями
          </Typography>
          <Typography variant="body2" className="subtitle">
            Огляд, фільтрація та оновлення статусів клієнтських замовлень
          </Typography>
        </div>
      </Box>

      <OrdersStats
        newCount={serverCounts.new || 0}
        shippedCount={serverCounts.ready_for_pickup || 0}
        cancelledCount={serverCounts.cancelled || 0}
        allCount={serverCounts.all || 0}
      />

      <div className="admin-solid-card order-toolbar-card">
        <AdminFilterTabs
          activeTab={activeFilter}
          onChange={handleFilterChange}
          tabs={filterTabs}
          counts={serverCounts}
          ariaLabel="Фільтр замовлень"
        />

        <div className="toolbar-divider" />

        <div className="table-header-actions">
          <AdminSearchInput
            value={localSearchInput}
            onChange={handleSearchChange}
            onClear={handleInstantSearchClear}
            placeholder="Пошук за № замовлення, ім'ям, email, телефоном..."
            className="search-wrapper"
            inputClassName="search-input"
            showIconWrapper={false}
          />

          <CustomSelect
            label="Сортування:"
            value={sort}
            onChange={handleSortChange}
            options={sortOptions}
            isLoading={isLoading}
          />

          <AdminRefreshButton
            onClick={fetchOrders}
            isLoading={isLoading}
            className="refresh-table-btn"
            iconClassName="refresh-icon"
            title="Оновити таблицю"
          />
        </div>
      </div>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <OrdersTable
          orders={orders}
          searchQuery={searchQuery}
          isUpdating={isUpdating}
          activeDropdownOrderId={activeDropdownOrderId}
          setActiveDropdownOrderId={setActiveDropdownOrderId}
          onStatusChangeAttempt={handleStatusChangeAttempt}
          onViewDetails={setSelectedOrderForModal}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      <OrderDetailsModal
        order={selectedOrderForModal}
        open={Boolean(selectedOrderForModal)}
        onClose={() => setSelectedOrderForModal(null)}
        isUpdating={isUpdating === selectedOrderForModal?._id}
        onStatusChange={handleStatusChange}
        onStatusChangeAttempt={handleStatusChangeAttempt}
      />

      <ConfirmModal
        isOpen={cancelConfirmation.isOpen}
        onClose={() =>
          setCancelConfirmation((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={() => {
          handleStatusChange(cancelConfirmation.orderId, "cancelled");
          setCancelConfirmation((prev) => ({ ...prev, isOpen: false }));
        }}
        icon={ReportProblemOutlined}
        title="Скасування замовлення"
        message={`Ви впевнені, що хочете скасувати замовлення ${cancelConfirmation.orderNumber}?`}
        warning="Цю дію не можна скасувати!"
        confirmText="Скасувати замовлення"
        cancelText="Не скасовувати"
        type="danger"
      />
    </Box>
  );
};

export default OrderListPage;
