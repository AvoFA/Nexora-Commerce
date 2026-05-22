import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DashboardStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  to
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <Box
      className={`stat-mini-card stat-${variant}${to ? ' is-clickable' : ''}`}
      onClick={handleClick}
      style={{ cursor: to ? 'pointer' : 'default' }}
    >
      <div className="stat-icon-wrapper">
        {Icon && <Icon />}
      </div>
      <div className="stat-content">
        <p className="stat-label">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {subtitle && (
          <span className="stat-subtitle">
            {subtitle}
          </span>
        )}
      </div>
    </Box>
  );
};

export default DashboardStatCard;
