import React from 'react';
import LogItem from './LogItem';

const getDayLabel = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Сьогодні';
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) return 'Вчора';
  
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const groupLogs = (logs) => {
  const result = [];
  
  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    const prev = result[result.length - 1];
    
    if (
      prev && 
      current.user?._id === prev.user?._id &&
      current.targetModel === 'Product' &&
      prev.targetModel === 'Product' &&
      current.targetId === prev.targetId &&
      current.actionType === 'products' &&
      prev.actionType === 'products'
    ) {
      const stockRegex = /залишок змінено з (\d+) шт на (\d+) шт/;
      const currentMatch = current.description.match(stockRegex);
      const prevMatch = prev.description.match(stockRegex);
      
      const timeDiff = Math.abs(new Date(current.createdAt) - new Date(prev.createdAt));
      
      if (currentMatch && prevMatch && timeDiff <= 5 * 60 * 1000) {
        const olderOriginal = currentMatch[1];
        const newerFinal = prevMatch[2];
        const productName = current.description.split('"')[1] || '';
        
        prev.description = `Оновлено товар "${productName}" (залишок змінено з ${olderOriginal} шт на ${newerFinal} шт)`;
        continue;
      }
    }
    
    result.push({ ...current });
  }
  
  return result;
};

const LogTimeline = ({ logs, onOrderClick, searchQuery }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="log-timeline-empty">
        <p>Немає записів для відображення</p>
      </div>
    );
  }

  // Group consecutive updates for cleaner presentation
  const groupedLogs = groupLogs(logs);

  // Group logs by day
  const groups = groupedLogs.reduce((acc, log) => {
    const dayLabel = getDayLabel(log.createdAt);
    if (!acc[dayLabel]) {
      acc[dayLabel] = [];
    }
    acc[dayLabel].push(log);
    return acc;
  }, {});

  return (
    <div className="log-timeline-container">
      {Object.entries(groups).map(([dayLabel, groupLogs]) => (
        <div key={dayLabel} className="log-timeline-group">
          <div className="log-timeline-group-header">
            <span className="group-date-label">{dayLabel}</span>
          </div>
          <div className="log-timeline-group-items">
            {groupLogs.map((log) => (
              <LogItem 
                key={log._id} 
                log={log} 
                onOrderClick={onOrderClick} 
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogTimeline;
