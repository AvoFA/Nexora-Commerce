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
import { highlightMatch } from '@/utils/searchHighlight';

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

const LogItem = ({ log, onOrderClick, searchQuery }) => {
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
              {highlightMatch(part, searchQuery)}
            </a>
          );
        }
        return <strong key={index}>{highlightMatch(part, searchQuery)}</strong>;
      }
      if (isOrderNum) {
        if (log.targetModel === 'Order' && log.targetId) {
          return (
            <button 
              key={index} 
              onClick={handleActionClick}
              className="log-interactive-link"
            >
              {highlightMatch(part.trim(), searchQuery)}
            </button>
          );
        }
        return <strong key={index}>{highlightMatch(part, searchQuery)}</strong>;
      }
      return <React.Fragment key={index}>{highlightMatch(part, searchQuery)}</React.Fragment>;
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
            <span className="log-username">{highlightMatch(username, searchQuery)}</span>
            {log.user?.email && (
              <span className="log-user-email">({highlightMatch(log.user.email, searchQuery)})</span>
            )}
            {role && (
              <span className={`log-user-role role-${role}`}>
                {role === 'admin' ? 'Адмін' : 'Модератор'}
              </span>
            )}
            {log.actionType === 'moderation' && (
              <span className={`log-user-role moderation-badge-${log.targetModel === 'Review' ? 'review' : 'question'}`}>
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
          <div className={`log-metadata-section theme-${themeKey}`}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="log-metadata-toggle"
            >
              {getToggleText()}
            </button>
            
            {isExpanded && (
              <div className="log-metadata-box">
                {/* Product context for questions or reviews */}
                {log.metadata.productName && (
                  <div className="metadata-product-name">
                    Товар: <span>{highlightMatch(log.metadata.productName, searchQuery)}</span>
                  </div>
                )}
 
                {/* 1. Question Moderation details */}
                {log.metadata.questionText && (
                  <>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label">Запитання:</div>
                      <div className="metadata-qa-value">«{highlightMatch(log.metadata.questionText, searchQuery)}»</div>
                    </div>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label">Відповідь:</div>
                      <div className="metadata-qa-value">«{highlightMatch(log.metadata.answerText, searchQuery)}»</div>
                    </div>
                  </>
                )}
 
                {/* 2. Review Moderation details */}
                {log.metadata.reviewText && (
                  <>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label">Оцінка:</div>
                      <div className="metadata-qa-value rating-stars-value">
                        {'★'.repeat(log.metadata.rating || 5)}{'☆'.repeat(5 - (log.metadata.rating || 5))}
                      </div>
                    </div>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label">Відгук:</div>
                      <div className="metadata-qa-value">«{highlightMatch(log.metadata.reviewText, searchQuery)}»</div>
                    </div>
                    {log.metadata.pros && (
                      <div className="metadata-qa-item">
                        <div className="metadata-qa-label pros-label">Переваги:</div>
                        <div className="metadata-qa-value pros-value">«{highlightMatch(log.metadata.pros, searchQuery)}»</div>
                      </div>
                    )}
                    {log.metadata.cons && (
                      <div className="metadata-qa-item">
                        <div className="metadata-qa-label cons-label">Недоліки:</div>
                        <div className="metadata-qa-value cons-value">«{highlightMatch(log.metadata.cons, searchQuery)}»</div>
                      </div>
                    )}
                  </>
                )}
 
                {/* 3. Order Status changes details */}
                {log.metadata.oldStatus && (
                  <div className="metadata-order-details">
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label">Дані замовлення:</div>
                      <div className="metadata-qa-value order-summary-value">
                        Сума: <strong>{log.metadata.totalPrice} ₴</strong> | Кількість: <strong>{log.metadata.itemCount} шт.</strong>
                      </div>
                    </div>
                    <div className="metadata-qa-item">
                      <div className="metadata-qa-label">Зміна статусу:</div>
                      <div className="metadata-qa-value status-change-flow-value">
                        <span className={`log-status-badge status-${log.metadata.oldStatus}`}>
                          {statusLabelsMap[log.metadata.oldStatus] || log.metadata.oldStatus}
                        </span>
                        <span className="flow-arrow">➔</span>
                        <span className={`log-status-badge status-${log.metadata.newStatus}`}>
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
