import React from "react";
import CustomerRow from "./CustomerRow";
import Pagination from "../../../../components/common/Pagination/Pagination";

const SortableHeader = ({ label, sortKey, sortBy, sortOrder, onSort, className = "" }) => {
  const isSorted = sortBy === sortKey;
  const isSortable = ["createdAt", "totalSpent", "ordersCount", "lastOrderDate"].includes(sortKey);
  
  if (!isSortable) {
    return <th className={className}>{label}</th>;
  }
  
  return (
    <th 
      className={`sortable-header ${isSorted ? "is-active" : ""} ${className}`.trim()} 
      onClick={() => onSort(sortKey)}
      style={{ cursor: "pointer" }}
    >
      <span className="customer-sort-label">
        {label}
        {isSorted && (
          <span className="customer-sort-direction">
            {sortOrder === "asc" ? " ↑" : " ↓"}
          </span>
        )}
      </span>
    </th>
  );
};

const CustomerTable = ({
  customers = [],
  isLoading,
  isActionLoading,
  onViewDetails,
  onToggleBlock,
  // Pagination & Sorting props
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSortToggle
}) => {
  return (
    <div className="customer-table-card">
      <div style={{ overflowX: "auto" }}>
        <table className="admin-table customer-table">
          <thead>
            <tr>
              <SortableHeader
                label="Клієнт"
                sortKey="name"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSortToggle}
              />
              <SortableHeader
                label="Статус"
                sortKey="status"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSortToggle}
              />
              <SortableHeader
                label="Замовлення"
                sortKey="ordersCount"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSortToggle}
                className="text-center"
              />
              <SortableHeader
                label="Сума витрат"
                sortKey="totalSpent"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSortToggle}
              />
              <SortableHeader
                label="Сер. чек"
                sortKey="avgCheck"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSortToggle}
              />
              <SortableHeader
                label="Остання покупка"
                sortKey="lastOrderDate"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSortToggle}
              />
              <SortableHeader
                label="Реєстрація"
                sortKey="createdAt"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSortToggle}
              />
              <th className="actions-cell" style={{ textAlign: "right" }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "42px 16px" }}>
                  <span className="no-data-text text-secondary">Покупців не знайдено</span>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <CustomerRow
                  key={customer._id}
                  customer={customer}
                  onViewDetails={onViewDetails}
                  onToggleBlock={onToggleBlock}
                  isActionLoading={isActionLoading}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          isLoading={isLoading}
          itemLabel="покупців"
        />
      )}
    </div>
  );
};

export default CustomerTable;
