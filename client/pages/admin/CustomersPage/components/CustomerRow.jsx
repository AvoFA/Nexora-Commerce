import React from "react";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import {
  VisibilityOutlined as ViewIcon,
  Block as BlockIcon,
  CheckCircleOutline as ActiveIcon
} from "@mui/icons-material";
import { formatPrice } from "../../../../utils/formatPrice";
import { formatCustomerName, formatDate, getCustomerInitials } from "../../../../utils/customerFormatters";


const CustomerRow = ({ customer, onViewDetails, onToggleBlock, isActionLoading }) => {
  const isBlocked = customer.status === "blocked";

  return (
    <tr className={`customer-row ${isBlocked ? "is-blocked" : ""}`}>
      {/* 1. Name & Contacts */}
      <td className="customer-info-cell">
        <div className="customer-identity">
          <Avatar className="customer-avatar">
            {getCustomerInitials(customer.name, customer.surname)}
          </Avatar>
          <div className="customer-details">
            <span className="customer-name font-semibold">
              {formatCustomerName(customer, 'compact')}
            </span>
            <span className="customer-contacts text-secondary text-xs">
              {customer.email} {customer.phone && `• ${customer.phone}`}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Status badge */}
      <td className="customer-status-cell">
        <span className={`status-badge ${isBlocked ? "status-blocked" : "status-active"}`}>
          {isBlocked ? "Заблокований" : "Активний"}
        </span>
      </td>

      {/* 3. Orders Count */}
      <td className="customer-orders-cell text-center">
        <span className="orders-count font-medium">{customer.ordersCount || 0}</span>
      </td>

      {/* 4. Total Spent */}
      <td className="customer-spent-cell font-semibold">
        {formatPrice(customer.totalSpent || 0)}
      </td>

      {/* 5. Avg Check */}
      <td className="customer-avg-cell text-secondary">
        {formatPrice(customer.avgCheck || 0)}
      </td>

      {/* 6. Last Order Date */}
      <td className="customer-last-order-cell text-secondary text-sm">
        {formatDate(customer.lastOrderDate)}
      </td>

      {/* 7. Registration Date */}
      <td className="customer-registered-cell text-secondary text-sm">
        {formatDate(customer.createdAt)}
      </td>

      {/* 8. Actions */}
      <td className="customer-actions-cell text-right">
        <div className="action-buttons">
          <Tooltip title="Деталі покупця" arrow placement="top">
            <IconButton
              onClick={() => onViewDetails(customer._id)}
              className="action-btn view-btn"
              size="small"
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isBlocked ? "Розблокувати" : "Заблокувати"} arrow placement="top">
            <IconButton
              onClick={() => onToggleBlock(customer._id)}
              disabled={isActionLoading}
              className={`action-btn toggle-block-btn ${isBlocked ? "unblock-btn" : "block-btn"}`}
              size="small"
            >
              {isBlocked ? <ActiveIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};

export default CustomerRow;
