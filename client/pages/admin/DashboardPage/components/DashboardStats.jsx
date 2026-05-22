import React from 'react';
import { Box } from '@mui/material';
import {
  ReceiptLong,
  Payments,
  NewReleases,
  HelpOutline,
  RateReview,
  WarningAmber
} from '@mui/icons-material';
import DashboardStatCard from './DashboardStatCard';
import { formatPrice } from '../../../../utils/formatPrice';

const DashboardStats = ({ stats = {} }) => {
  return (
    <Box className="dashboard-stats-container" style={{ marginBottom: '24px' }}>
      {/* Daily Metrics Panel (Non-clickable) */}
      <Box className="stats-group-panel daily-metrics-panel">
        <div className="panel-header">
          <span className="panel-title">Статистика за сьогодні</span>
        </div>
        <div className="panel-grid">
          <DashboardStatCard
            title="Замовлення сьогодні"
            value={stats.ordersToday ?? 0}
            icon={ReceiptLong}
            variant="info"
          />
          <DashboardStatCard
            title="Оборот сьогодні"
            value={formatPrice(stats.turnoverToday ?? 0)}
            subtitle={`Загалом: ${formatPrice(stats.turnoverTotal ?? 0)}`}
            icon={Payments}
            variant="secondary"
          />
        </div>
      </Box>


      {/* Action Metrics Panel (Clickable / Interactive) */}
      <Box className="stats-group-panel action-metrics-panel">
        <div className="panel-header">
          <span className="panel-title">Потребують уваги</span>
        </div>
        <div className="panel-grid">
          <DashboardStatCard
            title="Нові замовлення"
            value={stats.newOrders ?? 0}
            icon={NewReleases}
            variant="primary"
            to="/admin/orders?status=new"
          />
          <DashboardStatCard
            title="Питання без відповіді"
            value={stats.unansweredQuestions ?? 0}
            icon={HelpOutline}
            variant="warning"
            to="/admin/reviews?type=questions&answerStatus=unanswered"
          />
          <DashboardStatCard
            title="Відгуки на модерації"
            value={stats.pendingReviews ?? 0}
            icon={RateReview}
            variant="danger"
            to="/admin/reviews?type=reviews&status=pending"
          />
          <DashboardStatCard
            title="Низький залишок"
            value={stats.lowStock ?? 0}
            icon={WarningAmber}
            variant="warning"
            to="/admin/products?lowStock=true"
          />
        </div>
      </Box>
    </Box>
  );
};

export default DashboardStats;
