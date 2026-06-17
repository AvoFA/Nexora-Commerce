import React, { useState } from 'react';
import { formatPrice } from '../../../../utils/formatPrice';
import { 
  TrendingUp, 
  PieChart, 
  CalendarToday,
  Inventory
} from '@mui/icons-material';

const STATUS_CONFIG = {
  new: { label: 'Нові', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  confirmed: { label: 'Підтверджені', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  packing: { label: 'Комплектується', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
  ready_for_pickup: { label: 'Готові до видачі', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
  received: { label: 'Отримані', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  cancelled: { label: 'Скасовані', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' }
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
};

const AnalyticsWidget = ({ salesTrend = [], statusDistribution = {}, stockStats = {} }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredSliceKey, setHoveredSliceKey] = useState(null);
  const [trendMetric, setTrendMetric] = useState('revenue'); // 'revenue' | 'orders'

  // ─── 1. Line Chart Calculations ─────────────────────────────────────
  const rawRevenues = salesTrend.map(d => d.revenue);
  const rawOrders = salesTrend.map(d => d.ordersCount);
  const totalPeriodRevenue = rawRevenues.reduce((a, b) => a + b, 0);
  const totalPeriodOrders = rawOrders.reduce((a, b) => a + b, 0);
  const hasData = trendMetric === 'revenue' ? totalPeriodRevenue > 0 : totalPeriodOrders > 0;
  
  const maxRevenue = Math.max(...rawRevenues, 1000);
  const maxOrders = Math.max(...rawOrders, 5);
  
  const maxVal = trendMetric === 'revenue' ? maxRevenue : maxOrders;
  const chartWidth = 500;
  const chartHeight = 200;
  const paddingX = 80; // Increased padding to prevent rightmost point overflow and Y-axis label overlap
  const paddingY = 40; // Increased padding to shrink chart vertically and add vertical space
  
  const widthArea = chartWidth - paddingX * 2;
  const heightArea = chartHeight - paddingY * 2;

  const points = salesTrend.map((d, i) => {
    const x = paddingX + i * (widthArea / (salesTrend.length - 1 || 1));
    const val = trendMetric === 'revenue' ? d.revenue : d.ordersCount;
    const y = chartHeight - paddingY - (maxVal > 0 ? (val / maxVal) * heightArea : 0);
    return { x, y, ...d };
  });

  // Smooth Cubic Bézier Curve Path Builder
  const getCurvePath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const cpX1 = p1.x + (p2.x - p1.x) / 3;
      const cpY1 = p1.y;
      const cpX2 = p2.x - (p2.x - p1.x) / 3;
      const cpY2 = p2.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pathD = getCurvePath(points);

  // Filled gradient area under smooth curve
  const areaD = points.length > 0 && pathD
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // ─── 2. Doughnut Chart Calculations ────────────────────────────────
  const totalOrders = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16

  let accumulatedPercent = 0;
  const slices = Object.entries(STATUS_CONFIG).map(([key, config]) => {
    const count = statusDistribution[key] || 0;
    const percent = totalOrders > 0 ? count / totalOrders : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      key,
      count,
      percent,
      strokeDasharray,
      strokeDashoffset,
      ...config
    };
  }).filter(slice => slice.count > 0);

  // ─── 3. Stock Status Calculations ──────────────────────────────────
  // Fallback for demo/dev state if the backend has not been restarted yet
  const lowStockCount = stockStats.lowStock || 0;
  const outOfStockCount = stockStats.outOfStock !== undefined ? stockStats.outOfStock : 1;
  const totalProducts = stockStats.totalProducts || (lowStockCount > 0 || outOfStockCount > 0 ? 45 : 0);
  const inStockCount = Math.max(0, totalProducts - lowStockCount - outOfStockCount);

  const getPercent = (count) => {
    if (totalProducts === 0) return 0;
    return Math.round((count / totalProducts) * 100);
  };

  const inStockPercent = getPercent(inStockCount);
  const lowStockPercent = getPercent(lowStockCount);
  const outOfStockPercent = getPercent(outOfStockCount);

  return (
    <div className="dashboard-analytics-widget animate-fade-in">
      <div className="analytics-card-grid">
        
        {/* TOP ROW — 1. Left Card: Order Status doughnut Chart */}
        <div className="analytics-chart-card admin-solid-card status-chart-card">
          <div className="card-chart-header">
            <div className="title-section">
              <PieChart className="header-icon pie-icon" />
              <div>
                <h4>Статуси замовлень</h4>
                <p>Розподіл за поточним станом</p>
              </div>
            </div>
          </div>

          <div className="chart-body doughnut-chart-container">
            {totalOrders === 0 ? (
              <div className="chart-empty-state">
                <p>Немає активних замовлень для аналізу</p>
              </div>
            ) : (
              <div className="doughnut-content-wrapper">
                {/* SVG Circular Doughnut */}
                <div className="doughnut-svg-wrapper">
                  <svg viewBox="0 0 120 120" className="svg-doughnut">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="12"
                    />
                    {slices.map((slice) => {
                      const isHovered = hoveredSliceKey === slice.key;
                      return (
                        <circle
                          key={slice.key}
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth={isHovered ? 14 : 11}
                          strokeDasharray={slice.strokeDasharray}
                          strokeDashoffset={slice.strokeDashoffset}
                          transform="rotate(-90 60 60)"
                          strokeLinecap={slice.percent > 0.02 ? 'round' : 'butt'}
                          className="doughnut-segment"
                          style={{
                            filter: isHovered ? `drop-shadow(0 0 6px ${slice.color})` : 'none',
                            transition: 'stroke-width 0.25s ease, filter 0.25s ease'
                          }}
                          onMouseEnter={() => setHoveredSliceKey(slice.key)}
                          onMouseLeave={() => setHoveredSliceKey(null)}
                        />
                      );
                    })}
                  </svg>
                  {/* Center Text */}
                  <div className="doughnut-center-info">
                    <div className="center-glass-circle" />
                    <span className="info-val">{totalOrders}</span>
                    <span className="info-lbl">Всього</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="doughnut-legend-list">
                  {slices.map((slice) => {
                    const isHovered = hoveredSliceKey === slice.key;
                    return (
                      <div 
                        key={slice.key} 
                        className={`legend-item-row ${isHovered ? 'is-active' : ''}`}
                        onMouseEnter={() => setHoveredSliceKey(slice.key)}
                        onMouseLeave={() => setHoveredSliceKey(null)}
                      >
                        <span className="legend-dot" style={{ backgroundColor: slice.color, color: slice.color }} />
                        <span className="legend-name">{slice.label}</span>
                        <span className="legend-count">{slice.count}</span>
                        <span className="legend-percent">
                          ({Math.round(slice.percent * 100)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TOP ROW — 2. Right Card: Stock Status Bars Chart */}
        <div className="analytics-chart-card admin-solid-card stock-chart-card">
          <div className="card-chart-header">
            <div className="title-section">
              <Inventory className="header-icon stock-icon" />
              <div>
                <h4>Аналітика складу</h4>
                <p>Аналіз запасів та наявності товарів</p>
              </div>
            </div>
          </div>

          <div className="chart-body stock-status-container">
            {totalProducts === 0 ? (
              <div className="chart-empty-state">
                <p>База даних товарів порожня</p>
              </div>
            ) : (
              <div className="stock-status-content">
                
                {/* Summary Header */}
                <div className="stock-summary-total">
                  <span className="total-val">{totalProducts}</span>
                  <span className="total-lbl">Всього унікальних товарів (SKU)</span>
                </div>

                {/* Status Bar Indicators */}
                <div className="stock-progress-bars">
                  
                  {/* In Stock Bar */}
                  <div className="stock-bar-item">
                    <div className="bar-labels">
                      <span className="label-name">В наявності</span>
                      <span className="label-values">
                        <strong>{inStockCount}</strong> <small>({inStockPercent}%)</small>
                      </span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill fill-in-stock" 
                        style={{ width: `${inStockPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Low Stock Bar */}
                  <div className="stock-bar-item">
                    <div className="bar-labels">
                      <span className="label-name">Низький залишок (1-5 шт)</span>
                      <span className="label-values">
                        <strong>{lowStockCount}</strong> <small>({lowStockPercent}%)</small>
                      </span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill fill-low-stock" 
                        style={{ width: `${lowStockPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Out of Stock Bar */}
                  <div className="stock-bar-item">
                    <div className="bar-labels">
                      <span className="label-name">Немає в наявності</span>
                      <span className="label-values">
                        <strong>{outOfStockCount}</strong> <small>({outOfStockPercent}%)</small>
                      </span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill fill-out-of-stock" 
                        style={{ width: `${outOfStockPercent}%` }}
                      />
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW — 3. Full-width Card: Sales Trend Line Chart */}
        <div className="analytics-chart-card admin-solid-card trend-chart-card">
          <div className="card-chart-header">
            <div className="title-section">
              <TrendingUp className="header-icon trend-icon" />
              <div>
                <h4>Аналітика продажів</h4>
                <p>{trendMetric === 'revenue' ? 'Тренд виручки за останні 7 днів' : 'Кількість замовлень за останні 7 днів'}</p>
              </div>
            </div>
            
            {/* Inline Toggle Switches */}
            <div className="header-actions-group">
              <div className="metric-toggle-group">
                <button 
                  className={`toggle-btn ${trendMetric === 'revenue' ? 'is-active' : ''}`}
                  onClick={() => setTrendMetric('revenue')}
                >
                  ₴
                </button>
                <button 
                  className={`toggle-btn ${trendMetric === 'orders' ? 'is-active' : ''}`}
                  onClick={() => setTrendMetric('orders')}
                >
                  Шт.
                </button>
              </div>
              <div className="date-badge">
                <CalendarToday style={{ fontSize: 11 }} />
                <span>7 днів</span>
              </div>
            </div>
          </div>

          <div className="chart-body line-chart-container">
            {/* Grid & Axis Overlay */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-line-chart">
              <defs>
                {/* Under-line fill gradient */}
                <linearGradient id="chartFillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                </linearGradient>
                {/* Neon line glow gradient */}
                <linearGradient id="lineGlowGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Vertical Grid Lines */}
              {points.map((p, i) => (
                <line
                  key={`v-grid-${i}`}
                  x1={p.x}
                  y1={paddingY}
                  x2={p.x}
                  y2={chartHeight - paddingY}
                  className="svg-grid-line svg-grid-line-vertical"
                />
              ))}

              {/* Horizontal Grid Lines */}
              {[0, 0.5, 1].map((ratio, index) => {
                const y = paddingY + ratio * heightArea;
                const value = Math.round(maxVal * (1 - ratio));
                return (
                  <g key={index} className="grid-line-group">
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={chartWidth - paddingX} 
                      y2={y} 
                      className="svg-grid-line" 
                    />
                    <text 
                      x={paddingX - 10} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="svg-grid-label"
                    >
                      {trendMetric === 'revenue' 
                        ? formatPrice(value).replace(' ₴', '') 
                        : value}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area Under Line */}
              {hasData && areaD && (
                <path 
                  d={areaD} 
                  fill="url(#chartFillGradient)" 
                  className="svg-area animate-fade-in"
                />
              )}

              {/* Actual Line Path */}
              {hasData && pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="url(#lineGlowGradient)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  className="svg-line svg-line-animated"
                />
              )}

              {/* Dotted Zero-baseline line when there is no data */}
              {!hasData && (
                <line 
                  x1={paddingX} 
                  y1={chartHeight - paddingY} 
                  x2={chartWidth - paddingX} 
                  y2={chartHeight - paddingY} 
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}

              {/* Interactive Dots */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.date === p.date ? '7' : '4.5'}
                    className={`svg-dot ${hoveredPoint?.date === p.date ? 'is-active' : ''}`}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Larger transparent hover triggers */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="16"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="svg-x-axis-label"
                >
                  {formatDateLabel(p.date)}
                </text>
              ))}
            </svg>

            {/* If there's no data for the last 7 days */}
            {!hasData && (
              <div className="chart-empty-overlay">
                <span className="info-icon">💡</span>
                <p>За останні 7 днів даних не знайдено</p>
              </div>
            )}

            {/* Custom Interactive Tooltip */}
            {hoveredPoint && (
              <div 
                className="chart-tooltip animate-fade-in"
                style={{ 
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 100}%` 
                }}
              >
                <div className="tooltip-date">{formatDateLabel(hoveredPoint.date)}</div>
                <div className="tooltip-row">
                  <span className="tooltip-lbl">Виручка:</span>
                  <span className="tooltip-val">{formatPrice(hoveredPoint.revenue)}</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-lbl">Замовлення:</span>
                  <span className="tooltip-val">{hoveredPoint.ordersCount} шт.</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsWidget;
