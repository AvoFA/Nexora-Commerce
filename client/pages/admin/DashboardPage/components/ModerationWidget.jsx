import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Tooltip, IconButton } from '@mui/material';
import {
  RateReviewOutlined,
  HelpOutlineOutlined,
  Star,
  StarBorder,
  ChatBubbleOutline,
  ChevronRight
} from '@mui/icons-material';
import { formatOrderDate } from '../../../../components/admin/orders/order.helpers';

const ModerationWidget = ({ pendingReviews = [], unansweredQuestions = [], onViewReview, onViewQuestion }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'questions'

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} style={{ fontSize: '0.9rem', color: '#fbbf24' }} />);
      } else {
        stars.push(<StarBorder key={i} style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.2)' }} />);
      }
    }
    return <div style={{ display: 'flex', gap: '1px' }}>{stars}</div>;
  };

  const getReviewTitle = (review) => {
    return review.user?.name || review.userName || 'Анонім';
  };

  const getQuestionTitle = (question) => {
    return question.user?.name || question.userName || 'Гість';
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="dashboard-bento-cell moderation-cell">
      <div className="widget-header" style={{ borderBottom: 'none' }}>
        <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChatBubbleOutline fontSize="small" style={{ opacity: 0.8 }} />
          Центр модерації
        </h3>
        <button
          className="widget-action-btn"
          onClick={() => {
            if (activeTab === 'reviews') {
              navigate('/admin/reviews?type=reviews&status=pending');
            } else {
              navigate('/admin/reviews?type=questions&answerStatus=unanswered');
            }
          }}
        >
          Перейти
        </button>
      </div>

      {/* Tabs selectors with calm dark aesthetics */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 20px',
        marginTop: '12px'
      }}>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'reviews' ? '2px solid var(--primary-color, #3b82f6)' : '2px solid transparent',
            color: activeTab === 'reviews' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            padding: '10px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RateReviewOutlined style={{ fontSize: '1rem' }} />
          Відгуки ({pendingReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'questions' ? '2px solid var(--primary-color, #3b82f6)' : '2px solid transparent',
            color: activeTab === 'questions' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            padding: '10px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <HelpOutlineOutlined style={{ fontSize: '1rem' }} />
          Запитання ({unansweredQuestions.length})
        </button>
      </div>

      <div className="widget-content" style={{ padding: '12px 20px' }}>
        {activeTab === 'reviews' ? (
          pendingReviews.length === 0 ? (
            <div className="widget-empty-state">
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Немає відгуків на модерації</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingReviews.map((review) => (
                <div
                  key={review._id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => onViewReview && onViewReview(review)}
                  className="moderation-item-hover"
                >
                  <Avatar
                    src={review.product?.image}
                    variant="rounded"
                    style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{getReviewTitle(review)}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{formatOrderDate(review.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {renderStars(review.rating)}
                      <span style={{ fontSize: '0.75rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                        {review.product?.name}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.8, wordBreak: 'break-word' }}>
                      {truncateText(review.comment)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronRight style={{ opacity: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          unansweredQuestions.length === 0 ? (
            <div className="widget-empty-state">
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Немає нових запитань</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {unansweredQuestions.map((question) => (
                <div
                  key={question._id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => onViewQuestion && onViewQuestion(question)}
                  className="moderation-item-hover"
                >
                  <Avatar
                    src={question.product?.image}
                    variant="rounded"
                    style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{getQuestionTitle(question)}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{formatOrderDate(question.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Про товар: {question.product?.name}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.8, wordBreak: 'break-word' }}>
                      {truncateText(question.text)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronRight style={{ opacity: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ModerationWidget;
