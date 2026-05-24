import React from "react";
import {
  Inventory2Outlined,
  LocalShippingOutlined,
  ReportProblemOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";

const OrdersStats = ({ newCount = 0, shippedCount = 0, cancelledCount = 0, allCount = 0 }) => {
  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card stat-warning">
        <div className="stat-card-icon">
          <Inventory2Outlined />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Нових замовлень</span>
          <span className="stat-card-subtext">Очікують на підтвердження</span>
        </div>
        <span className="stat-card-value">{newCount}</span>
      </div>
      <div className="admin-stat-card stat-success">
        <div className="stat-card-icon">
          <LocalShippingOutlined />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Готові</span>
          <span className="stat-card-subtext">Готові до видачі</span>
        </div>
        <span className="stat-card-value">{shippedCount}</span>
      </div>
      <div className="admin-stat-card stat-danger">
        <div className="stat-card-icon">
          <ReportProblemOutlined />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Скасовано</span>
          <span className="stat-card-subtext">Відхилені замовлення</span>
        </div>
        <span className="stat-card-value">{cancelledCount}</span>
      </div>
      <div className="admin-stat-card stat-primary">
        <div className="stat-card-icon">
          <ReceiptLongOutlined />
        </div>
        <div className="stat-card-info">
          <span className="stat-card-label">Загальна кількість</span>
          <span className="stat-card-subtext">За весь час роботи</span>
        </div>
        <span className="stat-card-value">{allCount}</span>
      </div>
    </div>
  );
};

export default OrdersStats;
