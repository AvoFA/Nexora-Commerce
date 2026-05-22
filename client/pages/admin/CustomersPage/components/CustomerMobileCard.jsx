import React from "react";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import {
  VisibilityOutlined as ViewIcon,
  Block as BlockIcon,
  CheckCircleOutline as ActiveIcon
} from "@mui/icons-material";
import { formatPrice } from "../../../../utils/formatPrice";
import { formatCustomerName, formatDate, getCustomerInitials } from "../../../../utils/customerFormatters";


const CustomerMobileCard = ({ customer, onViewDetails, onToggleBlock, isActionLoading }) => {
  const isBlocked = customer.status === "blocked";

  return (
    <div className={`customer-mobile-card admin-solid-card ${isBlocked ? "is-blocked" : ""}`}>
      <div className="card-header">
        <div className="customer-identity">
          <Avatar className="customer-avatar">
            {getCustomerInitials(customer.name, customer.surname)}
          </Avatar>
          <div className="customer-details">
            <span className="customer-name font-semibold">{formatCustomerName(customer, 'compact')}</span>
            <span className="customer-email">{customer.email}</span>
            {customer.phone && <span className="customer-phone">{customer.phone}</span>}
          </div>
        </div>
        <span className={`status-badge ${isBlocked ? "status-blocked" : "status-active"}`}>
          {isBlocked ? "Блок" : "Активний"}
        </span>
      </div>

      <div className="card-body">
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Замовлення</span>
            <span className="metric-value">{customer.ordersCount || 0}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Сума витрат</span>
            <span className="metric-value font-semibold">{formatPrice(customer.totalSpent || 0)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Середній чек</span>
            <span className="metric-value">{formatPrice(customer.avgCheck || 0)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Остання покупка</span>
            <span className="metric-value">{formatDate(customer.lastOrderDate)}</span>
          </div>
        </div>
        <div className="card-footer-meta">
          <span className="registered-label">Реєстрація: {formatDate(customer.createdAt)}</span>
        </div>
      </div>

      <div className="card-actions">
        <button
          onClick={() => onViewDetails(customer._id)}
          className="btn-action btn-view"
        >
          <ViewIcon fontSize="small" sx={{ mr: 0.5 }} />
          Деталі
        </button>

        <button
          onClick={() => onToggleBlock(customer._id)}
          disabled={isActionLoading}
          className={`btn-action btn-toggle-block ${isBlocked ? "btn-unblock" : "btn-block"}`}
        >
          {isBlocked ? (
            <>
              <ActiveIcon fontSize="small" sx={{ mr: 0.5 }} />
              Розблокувати
            </>
          ) : (
            <>
              <BlockIcon fontSize="small" sx={{ mr: 0.5 }} />
              Заблокувати
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomerMobileCard;
