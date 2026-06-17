import React, { useState } from 'react';
import { 
  VpnKey as AuthIcon, 
  ReceiptLong as OrdersIcon, 
  Inventory as ProductsIcon, 
  Shield as ModerationIcon,
  OpenInNew as OpenInNewIcon,
  Comment as CommentIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

const actionTypeConfig = {
  auth: {
    icon: AuthIcon,
    colorClass: 'log-type-auth',
    label: 'Безпека'
  },
  orders: {
    icon: OrdersIcon,
    colorClass: 'log-type-orders',
    label: 'Замовлення'
  },
  products: {
    icon: ProductsIcon,
    colorClass: 'log-type-products',
    label: 'Товари'
  },
  moderation: {
    icon: ModerationIcon,
    colorClass: 'log-type-moderation',
    label: 'Модерація'
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'щойно';
  if (diffMins < 60) return `${diffMins} хв. тому`;
  
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return `Сьогодні о ${timeStr}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return `Вчора о ${timeStr}`;
  }
  
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusLabelsMap = {
  new: 'Нове',
  confirmed: 'Підтверджено',
  packing: 'Комплектується',
  ready_for_pickup: 'Готово до отримання',
  received: 'Отримано',
  cancelled: 'Скасовано'
};

const statusColorsMap = {
  new: { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.22)' },
  confirmed: { color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.22)' },
  packing: { color: '#a855f7', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.22)' },
  ready_for_pickup: { color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.22)' },
  received: { color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.22)' },
  cancelled: { color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.22)' }
};

const LogItem = ({ log, onOrderClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let config = actionTypeConfig[log.actionType] || {
    icon: ModerationIcon,
    colorClass: 'log-type-default',
    label: 'Інше'
  };

  // Dynamically resolve icon and styling colors based on targetModel for moderation logs
  if (log.actionType === 'moderation') {
    if (log.targetModel === 'Review') {
      config = {
        icon: CommentIcon,
        colorClass: 'log-type-reviews',
        label: 'Відгуки'
      };
    } else if (log.targetModel === 'Question') {
      config = {
        icon: HelpOutlineIcon,
        colorClass: 'log-type-questions',
        label: 'Запитання'
      };
    }
  }

  const IconComponent = config.icon;
  const username = log.user?.username || 'Система';
  const role = log.user?.role || '';
  const initial = username.charAt(0).toUpperCase();

  const handleActionClick = (e) => {
    if (log.targetModel === 'Order' && log.targetId) {
      e.preventDefault();
      onOrderClick(log.targetId);
    }
  };

  // Helper to render description with bold elements like #1234 or "Product Name"
  const renderFormattedDescription = (text) => {
    // Bold double quotes: "product name" -> inline product link or <strong>"product name"</strong>
    // Bold hashtags: #orderNumber -> <strong>#orderNumber</strong>
    const parts = text.split(/("[^"]+"|\s#\w+|\s#\d+)/g);
    return parts.map((part, index) => {
      const isOrderNum = part.startsWith(' #') || part.startsWith('#');
      if (part.startsWith('"') && part.endsWith('"')) {
        if (log.targetModel === 'Product' && log.targetId) {
          return (
            <a 
              key={index} 
              href={`/product/${log.targetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="log-interactive-link"
              style={{ display: 'inline' }}
            >
              {part}
            </a>
          );
        }
        return <strong key={index}>{part}</strong>;
      }
      if (isOrderNum) {
        if (log.targetModel === 'Order' && log.targetId) {
          return (
            <button 
              key={index} 
              onClick={handleActionClick}
              className="log-interactive-link"
            >
              {part.trim()}
            </button>
          );
        }
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  const hasMetadata = log.metadata && (
    log.metadata.questionText || 
    log.metadata.reviewText || 
    log.metadata.oldStatus
  );

  const getToggleText = () => {
    if (isExpanded) return 'Приховати деталі';
    if (log.metadata?.questionText) return 'Деталі відповіді';
    if (log.metadata?.reviewText) return 'Деталі відгуку';
    if (log.metadata?.oldStatus) return 'Деталі зміни статусу';
    return 'Деталі';
  };

  const metadataThemeMap = {
    auth: { color: '#3b82f6', background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.1)', labelColor: '#60a5fa' },
    orders: { color: '#10b981', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', labelColor: '#34d399' },
    products: { color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.03)', border: '1px solid rgba(139, 92, 246, 0.1)', labelColor: '#a78bfa' },
    moderation: { color: '#fb923c', background: 'rgba(251, 146, 60, 0.03)', border: '1px solid rgba(251, 146, 60, 0.1)', labelColor: '#fdba74' },
    moderation_review: { color: '#38bdf8', background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.1)', labelColor: '#7dd3fc' }
  };

  const themeKey = (log.actionType === 'moderation' && log.targetModel === 'Review') ? 'moderation_review' : log.actionType;
  const theme = metadataThemeMap[themeKey] || metadataThemeMap.moderation;

  return (
    <div className="log-item-row">
      <div className="log-timeline-marker">
        <div className={`log-icon-badge ${config.colorClass}`}>
          <IconComponent className="mui-icon" />
        </div>
        <div className="log-timeline-line" />
      </div>

      <div className="log-item-content">
        <div className="log-item-header">
          <div className="log-user-info">
            <div className={`log-user-avatar role-avatar-${role}`}>
              {initial}
            </div>
            <span className="log-username">{username}</span>
            {role && (
              <span className={`log-user-role role-${role}`}>
                {role === 'admin' ? 'Адмін' : 'Модератор'}
              </span>
            )}
            {log.actionType === 'moderation' && (
              <span className="log-user-role" style={{
                color: log.targetModel === 'Review' ? '#38bdf8' : '#fb923c',
                background: log.targetModel === 'Review' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(251, 146, 60, 0.12)',
                border: log.targetModel === 'Review' ? '1px solid rgba(56, 189, 248, 0.22)' : '1px solid rgba(251, 146, 60, 0.22)',
                marginLeft: '4px'
              }}>
                {log.targetModel === 'Review' ? 'Відгук' : 'Питання'}
              </span>
            )}
          </div>
          <span className="log-time" title={new Date(log.createdAt).toLocaleString('uk-UA')}>
            {formatRelativeTime(log.createdAt)}
          </span>
        </div>

        <div className="log-item-body">
          <span className="log-desc">
            {renderFormattedDescription(log.description)}
          </span>
        </div>

        {hasMetadata && (
          <div className="log-metadata-section">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="log-metadata-toggle"
              style={{ color: theme.color }}
            >
              {getToggleText()}
            </button>
            
            {isExpanded && (
              <div className="log-metadata-box" style={{ border: theme.border, background: theme.background }}>
                {/* Product context for questions or reviews */}
                {log.metadata.productName && (
                  <div className="metadata-product-name">
                    Товар: <span>{log.metadata.productName}</span>
                  </div>
                )}

                {/* 1. Question Moderation details */}
                {log.metadata.questionText && (
                  <>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label" style={{ color: theme.labelColor }}>Запитання:</div>
                      <div className="metadata-qa-value" style={{ borderLeftColor: theme.color }}>«{log.metadata.questionText}»</div>
                    </div>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label" style={{ color: theme.labelColor }}>Відповідь:</div>
                      <div className="metadata-qa-value" style={{ borderLeftColor: theme.color }}>«{log.metadata.answerText}»</div>
                    </div>
                  </>
                )}

                {/* 2. Review Moderation details */}
                {log.metadata.reviewText && (
                  <>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label" style={{ color: theme.labelColor }}>Оцінка:</div>
                      <div className="metadata-qa-value" style={{ fontStyle: 'normal', letterSpacing: '2px', color: '#fb923c', borderLeftColor: theme.color }}>
                        {'★'.repeat(log.metadata.rating || 5)}{'☆'.repeat(5 - (log.metadata.rating || 5))}
                      </div>
                    </div>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label" style={{ color: theme.labelColor }}>Відгук:</div>
                      <div className="metadata-qa-value" style={{ borderLeftColor: theme.color }}>«{log.metadata.reviewText}»</div>
                    </div>
                    {log.metadata.pros && (
                      <div className="metadata-qa-item">
                        <div className="metadata-qa-label" style={{ color: '#10b981' }}>Переваги:</div>
                        <div className="metadata-qa-value" style={{ borderLeftColor: '#10b981' }}>«{log.metadata.pros}»</div>
                      </div>
                    )}
                    {log.metadata.cons && (
                      <div className="metadata-qa-item">
                        <div className="metadata-qa-label" style={{ color: '#ef4444' }}>Недоліки:</div>
                        <div className="metadata-qa-value" style={{ borderLeftColor: '#ef4444' }}>«{log.metadata.cons}»</div>
                      </div>
                    )}
                  </>
                )}

                {/* 3. Order Status changes details */}
                {log.metadata.oldStatus && (
                  <div className="metadata-order-details">
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label" style={{ color: theme.labelColor }}>Дані замовлення:</div>
                      <div className="metadata-qa-value" style={{ fontStyle: 'normal', borderLeftColor: theme.color }}>
                        Сума: <strong>{log.metadata.totalPrice} ₴</strong> | Кількість: <strong>{log.metadata.itemCount} шт.</strong>
                      </div>
                    </div>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label" style={{ color: theme.labelColor }}>Зміна статусу:</div>
                      <div className="metadata-qa-value" style={{ fontStyle: 'normal', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', borderLeftColor: theme.color }}>
                        <span className="log-status-badge" style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.72rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          ...(statusColorsMap[log.metadata.oldStatus] || { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)' })
                        }}>
                          {statusLabelsMap[log.metadata.oldStatus] || log.metadata.oldStatus}
                        </span>
                        <span style={{ color: '#64748b' }}>➔</span>
                        <span className="log-status-badge" style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.72rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          ...(statusColorsMap[log.metadata.newStatus] || { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)' })
                        }}>
                          {statusLabelsMap[log.metadata.newStatus] || log.metadata.newStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default LogItem;
