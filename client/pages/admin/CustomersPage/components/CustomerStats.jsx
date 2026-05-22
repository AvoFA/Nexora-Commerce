import React from "react";
import { CircularProgress } from "@mui/material";
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  ShoppingBag as ShoppingBagIcon,
  WorkspacePremium as LoyalIcon
} from "@mui/icons-material";

const CustomerStats = ({ stats, isLoading }) => {
  const cards = [
    {
      label: "Усього клієнтів",
      value: stats.totalCustomers,
      icon: PeopleIcon,
      color: "primary",
      desc: "Зареєстровані клієнти магазину"
    },
    {
      label: "Нові сьогодні",
      value: stats.newToday,
      icon: PersonAddIcon,
      color: "info",
      desc: "Реєстрації за поточну добу"
    },
    {
      label: "Активні покупці",
      value: stats.activeBuyers,
      icon: ShoppingBagIcon,
      color: "warning",
      desc: "Здійснили замовлення за 30 днів"
    },
    {
      label: "Постійні клієнти",
      value: stats.loyalCustomers,
      icon: LoyalIcon,
      color: "secondary",
      desc: "Мають 3 та більше замовлень"
    }
  ];

  return (
    <div className="admin-stats-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`admin-stat-card stat-${card.color}`}>
            <div className="stat-card-icon">
              <Icon />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-label">{card.label}</span>
              {card.desc && <span className="stat-card-subtext">{card.desc}</span>}
            </div>
            <span className="stat-card-value">
              {isLoading ? (
                <CircularProgress size={20} color="inherit" thickness={4} />
              ) : (
                card.value
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerStats;
