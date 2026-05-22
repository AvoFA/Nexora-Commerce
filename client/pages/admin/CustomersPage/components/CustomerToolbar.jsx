import React from "react";
import AdminRefreshButton from "../../../../components/admin/common/AdminRefreshButton.jsx";
import AdminSearchInput from "../../../../components/admin/common/AdminSearchInput.jsx";
import CustomSelect from "../../../../components/common/CustomSelect/CustomSelect.jsx";

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Спочатку нові" },
  { value: "createdAt_asc", label: "Спочатку старі" },
  { value: "totalSpent_desc", label: "Сума замовлень: від більшої" },
  { value: "totalSpent_asc", label: "Сума замовлень: від меншої" },
  { value: "ordersCount_desc", label: "Кількість замовлень: від більшої" },
  { value: "ordersCount_asc", label: "Кількість замовлень: від меншої" },
  { value: "lastOrderDate_desc", label: "Останнє замовлення: від нових" }
];

const STATUS_OPTIONS = [
  { value: "all", label: "Усі статуси" },
  { value: "active", label: "Активні" },
  { value: "blocked", label: "Заблоковані" }
];

const CustomerToolbar = ({
  searchTerm,
  onSearchChange,
  onSearchClear,
  statusFilter,
  onStatusChange,
  sortValue,
  onSortChange,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="customer-toolbar-card">
      <div className="customer-toolbar-layout">
        <AdminSearchInput
          value={searchTerm}
          onChange={onSearchChange}
          onClear={onSearchClear}
          placeholder="Пошук клієнтів за ім'ям, email, тел..."
          disabled={isLoading}
        />

        <div className="customer-toolbar-controls">
          <CustomSelect
            id="customer-status-filter"
            value={statusFilter || "all"}
            onChange={(val) => onStatusChange(val === "all" ? "" : val)}
            options={STATUS_OPTIONS}
            isLoading={isLoading}
            className="customer-filter-select"
          />

          <CustomSelect
            id="customer-sort-filter"
            value={sortValue}
            onChange={onSortChange}
            options={SORT_OPTIONS}
            isLoading={isLoading}
            className="customer-filter-select customer-sort-select"
          />
        </div>

        <div className="customer-toolbar-actions">
          <AdminRefreshButton
            onClick={onRefresh}
            isLoading={isLoading}
            title="Оновити список клієнтів"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerToolbar;
