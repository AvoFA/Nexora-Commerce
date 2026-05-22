import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { ReportProblemOutlined } from "@mui/icons-material";
import { formatCustomerName } from "../../../utils/customerFormatters";

// Hooks
import { useAdminCustomers } from "./hooks/useAdminCustomers";

// Components
import CustomerStats from "./components/CustomerStats";
import CustomerToolbar from "./components/CustomerToolbar";
import CustomerTable from "./components/CustomerTable";
import CustomerMobileCard from "./components/CustomerMobileCard";
import CustomerDetailsModal from "./components/CustomerDetailsModal";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";

// Styles
import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./CustomersPage.scss";

const CustomersPage = () => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  
  const {
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
    setPage,
    limit,
    setLimit,
    handleRefresh,
    handleToggleBlock,
    handleViewDetails,
    handleCloseDetails
  } = useAdminCustomers(token);

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState("");

  // Confirmation modal state for blocking a customer
  const [blockConfirm, setBlockConfirm] = useState({
    isOpen: false,
    customerId: null,
    customerName: ""
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch.trim() !== search) {
        setSearch(localSearch.trim());
        setPage(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, search, setSearch, setPage]);

  // Handle toolbar sorting selection
  const handleSortSelectChange = (value) => {
    const [newSortBy, newSortOrder] = value.split("_");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  // Handle inline table column header clicks
  const handleTableSortToggle = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Triggered when block button is clicked
  const handleBlockActionClick = (id) => {
    const target = customers.find((c) => c._id === id);
    if (!target) return;

    if (target.status === "blocked") {
      // Unblock immediately (safe action)
      handleToggleBlock(id);
    } else {
      // Require confirmation to block
      setBlockConfirm({
        isOpen: true,
        customerId: id,
        customerName: formatCustomerName(target, 'compact')
      });
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <Box className="admin-page-container customer-page-container">
      {/* Title Header */}
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Керування клієнтами
          </Typography>
          <Typography variant="body2" className="subtitle" sx={{ color: "var(--text-secondary, #94a3b8)", opacity: 0.85, mt: 0.5 }}>
            Аналіз покупців, їх замовлень та активності
          </Typography>
        </div>
      </Box>

      {/* Stats Cards Row */}
      <CustomerStats stats={stats} isLoading={isStatsLoading} />

      {/* Filter and Search Toolbar */}
      <CustomerToolbar
        searchTerm={localSearch}
        onSearchChange={setLocalSearch}
        onSearchClear={() => setLocalSearch("")}
        statusFilter={status}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        sortValue={`${sortBy}_${sortOrder}`}
        onSortChange={handleSortSelectChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Main Content (Table on desktop, Cards on mobile) */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-only-view">
            <CustomerTable
              customers={customers}
              isLoading={isLoading}
              isActionLoading={isActionLoading}
              onViewDetails={handleViewDetails}
              onToggleBlock={handleBlockActionClick}
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.totalCustomers}
              limit={pagination.limit || limit}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortToggle={handleTableSortToggle}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-only-view">
            {customers.length === 0 ? (
              <Box className="admin-solid-card" sx={{ py: 6, textCenter: "center" }}>
                <span className="no-data-text">Покупців не знайдено</span>
              </Box>
            ) : (
              <div className="customer-mobile-list">
                {customers.map((customer) => (
                  <CustomerMobileCard
                    key={customer._id}
                    customer={customer}
                    onViewDetails={handleViewDetails}
                    onToggleBlock={handleBlockActionClick}
                    isActionLoading={isActionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        orders={customerOrders}
        open={Boolean(selectedCustomer)}
        onClose={handleCloseDetails}
        onToggleBlock={handleToggleBlock}
        isActionLoading={isActionLoading || isDetailsLoading}
      />

      {/* Block Confirmation Dialog */}
      <ConfirmModal
        isOpen={blockConfirm.isOpen}
        onClose={() => setBlockConfirm((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          handleToggleBlock(blockConfirm.customerId);
          setBlockConfirm((prev) => ({ ...prev, isOpen: false }));
        }}
        icon={ReportProblemOutlined}
        title="Блокування клієнта"
        message={`Ви впевнені, що хочете заблокувати клієнта ${blockConfirm.customerName}?`}
        warning="Заблокований користувач втратить можливість авторизуватися на сайті!"
        confirmText="Заблокувати"
        cancelText="Скасувати"
        type="danger"
      />
    </Box>
  );
};

export default CustomersPage;
