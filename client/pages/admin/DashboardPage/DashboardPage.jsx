import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useDashboardData } from './hooks/useDashboardData';
import DashboardStats from './components/DashboardStats';
import RecentOrdersWidget from './components/RecentOrdersWidget';
import ModerationWidget from './components/ModerationWidget';
import LowStockWidget from './components/LowStockWidget';
import ModeratorDashboard from './components/ModeratorDashboard';
import AdminRefreshButton from '../../../components/admin/common/AdminRefreshButton';
import { toast } from 'sonner';
import { ReportProblemOutlined } from '@mui/icons-material';
import { ADMIN_ROLES, getStoredAdminRole } from '../../../config/adminAccess';

// Modals & Drawers
import OrderDetailsModal from '../../../components/admin/orders/OrderDetailsModal';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal';
import ReviewDetailsModal from '../../../components/admin/moderation/ReviewDetailsModal';
import QuestionDetailsModal from '../../../components/admin/moderation/QuestionDetailsModal';
import QuestionReplyDrawer from '../../../components/admin/moderation/QuestionReplyDrawer';

// Services & Helpers
import { getOrderNumber } from '../../../components/admin/orders/order.helpers';
import { updateOrderStatus } from '../../../services/orderService';
import { updateReviewStatus } from '../../../services/reviewService';
import { updateQuestionStatus, answerQuestion, deleteQuestion } from '../../../services/questionService';
import { getAnyAuthToken } from '../../../utils/authStorage';

import './DashboardPage.scss';

const DashboardPage = () => {
  const adminRole = getStoredAdminRole();
  const isModeratorDashboard = adminRole === ADMIN_ROLES.MODERATOR;
  const { data, isLoading, error, refresh } = useDashboardData({
    enabled: !isModeratorDashboard,
  });

  // Modals & Drawers States
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [cancelConfirmation, setCancelConfirmation] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: '',
  });
  const [selectedReviewForModal, setSelectedReviewForModal] = useState(null);
  const [selectedQuestionForModal, setSelectedQuestionForModal] = useState(null);
  const [selectedQuestionForAnswer, setSelectedQuestionForAnswer] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionDeleteTarget, setQuestionDeleteTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);

  if (isModeratorDashboard) {
    return <ModeratorDashboard />;
  }

  // Handlers for Orders
  const handleOrderStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token = getAnyAuthToken();
      const res = await updateOrderStatus(id, newStatus, token);
      if (res.success) {
        toast.success(res.message || 'Статус замовлення оновлено');
        setSelectedOrderForModal((current) =>
          current?._id === id
            ? {
                ...current,
                status: newStatus,
                history: res.order?.history || current.history,
              }
            : current
        );
        refresh();
      }
    } catch (err) {
      toast.error(err.message || 'Помилка оновлення статусу');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOrderStatusChangeAttempt = (order, newStatus) => {
    if (newStatus === 'cancelled') {
      setCancelConfirmation({
        isOpen: true,
        orderId: order._id,
        orderNumber: getOrderNumber(order),
      });
    } else {
      handleOrderStatusChange(order._id, newStatus);
    }
  };

  // Handlers for Reviews
  const handleReviewStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token = getAnyAuthToken();
      const res = await updateReviewStatus(id, newStatus, token);
      if (res.success) {
        if (newStatus === 'approved') {
          toast.success('Відгук успішно схвалено та опубліковано!');
        } else if (newStatus === 'rejected') {
          toast.error('Відгук відхилено та знято з публікації.');
        } else if (newStatus === 'pending') {
          toast.info('Відгук успішно повернуто на модерацію.');
        }
        setSelectedReviewForModal(null);
        refresh();
      }
    } catch (err) {
      toast.error(err.message || 'Помилка оновлення статусу');
    } finally {
      setIsUpdating(null);
    }
  };

  // Handlers for Questions
  const handleQuestionStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token = getAnyAuthToken();
      const res = await updateQuestionStatus(id, newStatus, token);
      if (res.success) {
        if (newStatus === 'approved') {
          toast.success('Запитання успішно схвалено та опубліковано!');
        } else if (newStatus === 'rejected') {
          toast.error('Запитання відхилено та знято з публікації.');
        } else if (newStatus === 'pending') {
          toast.info('Запитання успішно повернуто на модерацію.');
        }
        setSelectedQuestionForModal(null);
        refresh();
      }
    } catch (err) {
      toast.error(err.message || 'Помилка оновлення статусу');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOpenQuestionReply = (question) => {
    setSelectedQuestionForAnswer(question);
    setAnswerText(question.answer || '');
  };

  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) {
      toast.error('Введіть текст відповіді');
      return;
    }
    try {
      setIsAnswering(true);
      const token = getAnyAuthToken();
      const res = await answerQuestion(selectedQuestionForAnswer._id, answerText, token);
      if (res.success) {
        toast.success('Відповідь успішно опубліковано!');
        setSelectedQuestionForAnswer(null);
        setAnswerText('');
        setSelectedQuestionForModal(null);
        refresh();
      }
    } catch (err) {
      toast.error(err.message || 'Помилка публікації відповіді');
    } finally {
      setIsAnswering(false);
    }
  };

  const handleQuestionDelete = (id) => {
    const unansweredQuestions = data?.unansweredQuestions || [];
    const targetQuestion = selectedQuestionForModal?._id === id
      ? selectedQuestionForModal
      : unansweredQuestions.find((q) => q._id === id);

    setQuestionDeleteTarget(targetQuestion || { _id: id });
  };

  const handleConfirmQuestionDelete = async () => {
    if (!questionDeleteTarget?._id) return;
    try {
      setIsUpdating(questionDeleteTarget._id);
      const token = getAnyAuthToken();
      const res = await deleteQuestion(questionDeleteTarget._id, token);
      if (res.success) {
        toast.success('Запитання успішно видалено!');
        if (selectedQuestionForModal?._id === questionDeleteTarget._id) {
          setSelectedQuestionForModal(null);
        }
        setQuestionDeleteTarget(null);
        refresh();
      }
    } catch (err) {
      toast.error(err.message || 'Помилка видалення запитання');
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="admin-dashboard-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="widget-loader-container">
          <div className="spinner"></div>
          <Typography variant="body2" sx={{ mt: 2 }}>Завантаження аналітики дашборду...</Typography>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="admin-dashboard-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="widget-error-container">
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>Помилка завантаження даних</Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>{error}</Typography>
          <button
            onClick={refresh}
            className="widget-action-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  const { stats = {}, recentOrders = [], pendingReviews = [], unansweredQuestions = [], lowStockProducts = [] } = data || {};

  return (
    <Box className="admin-dashboard-page">
      {/* Page Header */}
      <Box className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Центр управління магазином
          </Typography>
          <Typography variant="body2" className="subtitle" sx={{ color: "var(--text-secondary, #94a3b8)", opacity: 0.85, mt: 0.5 }}>
            Оперативний огляд та швидкі дії для адміністратора Nexora
          </Typography>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLoading && (
            <span style={{ fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic' }}>
              Оновлення даних...
            </span>
          )}
          <AdminRefreshButton
            onClick={refresh}
            isLoading={isLoading}
          />
        </div>
      </Box>

      {/* Top 6 Interactive Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Bento Grid layout for Operational Control */}
      <div className="dashboard-bento-grid">
        {/* Recent Orders (7) - left widget (span 7) */}
        <RecentOrdersWidget
          orders={recentOrders}
          onViewOrder={setSelectedOrderForModal}
        />

        {/* Moderation Center (pending reviews & unanswered questions) - right widget (span 5) */}
        <ModerationWidget
          pendingReviews={pendingReviews}
          unansweredQuestions={unansweredQuestions}
          onViewReview={setSelectedReviewForModal}
          onViewQuestion={setSelectedQuestionForModal}
        />

        {/* Low Stock (stock <= 5) with inline correction - bottom widget (span 12) */}
        <LowStockWidget
          products={lowStockProducts}
          onRefresh={refresh}
        />
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrderForModal}
        open={Boolean(selectedOrderForModal)}
        onClose={() => setSelectedOrderForModal(null)}
        isUpdating={isUpdating === selectedOrderForModal?._id}
        onStatusChange={handleOrderStatusChange}
        onStatusChangeAttempt={handleOrderStatusChangeAttempt}
      />

      {/* Cancel Order Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelConfirmation.isOpen}
        onClose={() =>
          setCancelConfirmation((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={() => {
          handleOrderStatusChange(cancelConfirmation.orderId, 'cancelled');
          setCancelConfirmation((prev) => ({ ...prev, isOpen: false }));
        }}
        icon={ReportProblemOutlined}
        title="Скасування замовлення"
        message={`Ви впевнені, що хочете скасувати замовлення ${cancelConfirmation.orderNumber}?`}
        warning="Цю дію не можна скасувати!"
        confirmText="Скасувати замовлення"
        cancelText="Не скасовувати"
        type="danger"
      />

      {/* Review Details Modal */}
      <ReviewDetailsModal
        isOpen={Boolean(selectedReviewForModal)}
        onClose={() => setSelectedReviewForModal(null)}
        review={selectedReviewForModal}
        isUpdating={isUpdating === selectedReviewForModal?._id}
        onStatusChange={handleReviewStatusChange}
      />

      {/* Question Details Modal */}
      <QuestionDetailsModal
        isOpen={Boolean(selectedQuestionForModal)}
        onClose={() => setSelectedQuestionForModal(null)}
        question={selectedQuestionForModal}
        isUpdating={isUpdating === selectedQuestionForModal?._id}
        onStatusChange={handleQuestionStatusChange}
        onOpenReply={handleOpenQuestionReply}
        onDelete={handleQuestionDelete}
      />

      {/* Question Reply Drawer */}
      <QuestionReplyDrawer
        isOpen={Boolean(selectedQuestionForAnswer)}
        onClose={() => setSelectedQuestionForAnswer(null)}
        question={selectedQuestionForAnswer}
        answerText={answerText}
        onAnswerTextChange={setAnswerText}
        isAnswering={isAnswering}
        onSubmit={handleAnswerSubmit}
      />

      {/* Delete Question Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(questionDeleteTarget)}
        onClose={() => setQuestionDeleteTarget(null)}
        onConfirm={handleConfirmQuestionDelete}
        title="Видалення запитання"
        message="Ви впевнені, що хочете видалити це запитання? Цю дію не можна скасувати."
        confirmText="Видалити"
        cancelText="Скасувати"
        type="danger"
        confirmDisabled={isUpdating === questionDeleteTarget?._id}
      />
    </Box>
  );
};

export default DashboardPage;
