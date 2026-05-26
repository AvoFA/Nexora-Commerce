import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import {
  ChatBubbleOutline,
  CheckCircleOutline,
  HelpOutlineOutlined,
  RateReviewOutlined,
  ReportProblemOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { toast } from "sonner";
import AdminRefreshButton from "../../../../components/admin/common/AdminRefreshButton";
import ConfirmModal from "../../../../components/common/ConfirmModal/ConfirmModal";
import ReviewDetailsModal from "../../../../components/admin/moderation/ReviewDetailsModal";
import QuestionDetailsModal from "../../../../components/admin/moderation/QuestionDetailsModal";
import QuestionReplyDrawer from "../../../../components/admin/moderation/QuestionReplyDrawer";
import { formatModerationDetailsDate } from "../../../../components/admin/moderation/moderation.helpers";
import { getAdminReviews, updateReviewStatus } from "../../../../services/reviewService";
import {
  answerQuestion,
  deleteQuestion,
  getAdminQuestions,
  updateQuestionStatus,
} from "../../../../services/questionService";

const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token");

const getAuthorName = (item) =>
  item?.user?.name || item?.userName || item?.name || item?.user?.email || "Гість";

const getProductName = (item) => item?.product?.name || "Товар не знайдено";

const getItemText = (item) => item?.comment || item?.text || item?.pros || item?.cons || "";

const truncateText = (text, limit = 116) => {
  if (!text) return "Без тексту";
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

const isCreatedToday = (item) => {
  if (!item?.createdAt) return false;

  const createdAt = new Date(item.createdAt);
  const today = new Date();

  return (
    createdAt.getFullYear() === today.getFullYear() &&
    createdAt.getMonth() === today.getMonth() &&
    createdAt.getDate() === today.getDate()
  );
};

const buildQueue = (pendingReviews, unansweredQuestions) =>
  [
    ...pendingReviews.map((item) => ({ type: "review", item })),
    ...unansweredQuestions.map((item) => ({ type: "question", item })),
  ]
    .sort((first, second) => {
      const firstTime = new Date(first.item?.createdAt || 0).getTime();
      const secondTime = new Date(second.item?.createdAt || 0).getTime();
      return secondTime - firstTime;
    })
    .slice(0, 7);

const buildOldestQueue = (pendingReviews, unansweredQuestions) =>
  [
    ...pendingReviews.map((item) => ({ type: "review", item })),
    ...unansweredQuestions.map((item) => ({ type: "question", item })),
  ]
    .sort((first, second) => {
      const firstTime = new Date(first.item?.createdAt || 0).getTime();
      const secondTime = new Date(second.item?.createdAt || 0).getTime();
      return firstTime - secondTime;
    })
    .slice(0, 4);

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    pendingReviews: [],
    unansweredQuestions: [],
    stats: {
      pendingReviews: 0,
      unansweredQuestions: 0,
      newToday: 0,
      totalQueue: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionForAnswer, setSelectedQuestionForAnswer] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null);
  const [questionDeleteTarget, setQuestionDeleteTarget] = useState(null);

  const fetchModerationDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Токен відсутній. Увійдіть в систему.");

      const [pendingReviewsData, unansweredQuestionsData] = await Promise.all([
        getAdminReviews(token, { status: "pending", sort: "createdAt_desc", limit: 50 }),
        getAdminQuestions(token, {
          status: "all",
          answerStatus: "unanswered",
          sort: "createdAt_desc",
          limit: 50,
        }),
      ]);

      const pendingReviews = pendingReviewsData.reviews || [];
      const unansweredQuestions = unansweredQuestionsData.questions || [];
      const newToday = [...pendingReviews, ...unansweredQuestions].filter(isCreatedToday).length;
      const pendingReviewsTotal =
        pendingReviewsData.counts?.pending ?? pendingReviewsData.total ?? pendingReviews.length;
      const unansweredQuestionsTotal =
        unansweredQuestionsData.unansweredCount ??
        unansweredQuestionsData.total ??
        unansweredQuestions.length;

      setData({
        pendingReviews,
        unansweredQuestions,
        stats: {
          pendingReviews: pendingReviewsTotal,
          unansweredQuestions: unansweredQuestionsTotal,
          newToday,
          totalQueue: pendingReviewsTotal + unansweredQuestionsTotal,
        },
      });
    } catch (err) {
      setError(err.message || "Не вдалося завантажити dashboard модератора");
      toast.error(err.message || "Не вдалося завантажити dashboard модератора");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModerationDashboard();
  }, [fetchModerationDashboard]);

  const queue = useMemo(
    () => buildQueue(data.pendingReviews, data.unansweredQuestions),
    [data.pendingReviews, data.unansweredQuestions],
  );

  const oldestQueue = useMemo(
    () => buildOldestQueue(data.pendingReviews, data.unansweredQuestions),
    [data.pendingReviews, data.unansweredQuestions],
  );

  const handleReviewStatusChange = async (id, status) => {
    try {
      setIsUpdating(id);
      const response = await updateReviewStatus(id, status, getToken());
      if (response.success) {
        toast.success("Статус відгуку оновлено");
        setSelectedReview(null);
        fetchModerationDashboard();
      }
    } catch (err) {
      toast.error(err.message || "Не вдалося оновити відгук");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleQuestionStatusChange = async (id, status) => {
    try {
      setIsUpdating(id);
      const response = await updateQuestionStatus(id, status, getToken());
      if (response.success) {
        toast.success("Статус питання оновлено");
        setSelectedQuestion(null);
        fetchModerationDashboard();
      }
    } catch (err) {
      toast.error(err.message || "Не вдалося оновити питання");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOpenQuestionReply = (question) => {
    setSelectedQuestionForAnswer(question);
    setAnswerText(question?.answer || "");
  };

  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) {
      toast.error("Введіть текст відповіді");
      return;
    }

    try {
      setIsAnswering(true);
      const response = await answerQuestion(
        selectedQuestionForAnswer._id,
        answerText.trim(),
        getToken(),
      );
      if (response.success) {
        toast.success("Відповідь опубліковано");
        setSelectedQuestionForAnswer(null);
        setSelectedQuestion(null);
        setAnswerText("");
        fetchModerationDashboard();
      }
    } catch (err) {
      toast.error(err.message || "Не вдалося опублікувати відповідь");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleQuestionDeleteRequest = (id) => {
    const question =
      selectedQuestion?._id === id
        ? selectedQuestion
        : data.unansweredQuestions.find((item) => item._id === id);

    setQuestionDeleteTarget(question || { _id: id });
    return false;
  };

  const handleConfirmQuestionDelete = async () => {
    if (!questionDeleteTarget?._id) return;

    try {
      setIsUpdating(questionDeleteTarget._id);
      const response = await deleteQuestion(questionDeleteTarget._id, getToken());
      if (response.success) {
        toast.success("Питання видалено");
        setQuestionDeleteTarget(null);
        setSelectedQuestion(null);
        fetchModerationDashboard();
      }
    } catch (err) {
      toast.error(err.message || "Не вдалося видалити питання");
    } finally {
      setIsUpdating(null);
    }
  };

  const statCards = [
    {
      title: "Відгуки на модерації",
      value: data.stats.pendingReviews,
      note: "очікують рішення",
      icon: RateReviewOutlined,
      accent: "blue",
      to: "/admin/reviews?type=reviews&status=pending",
    },
    {
      title: "Питання без відповіді",
      value: data.stats.unansweredQuestions,
      note: "потребують реакції",
      icon: HelpOutlineOutlined,
      accent: "amber",
      to: "/admin/reviews?type=questions&answerStatus=unanswered",
    },
    {
      title: "Нові за сьогодні",
      value: data.stats.newToday,
      note: "свіжий потік",
      icon: ChatBubbleOutline,
      accent: "green",
      to: "/admin/reviews?type=questions&answerStatus=unanswered",
    },
    {
      title: "Усього в черзі",
      value: data.stats.totalQueue,
      note: "відгуки і питання",
      icon: VisibilityOutlined,
      accent: "blue",
      to: "/admin/reviews?type=reviews&status=pending",
    },
  ];

  return (
    <Box className="admin-dashboard-page moderator-dashboard">
      <Box className="admin-page-header moderator-dashboard-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Dashboard модератора
          </Typography>
          <Typography variant="body2" className="subtitle">
            Робоча черга відгуків і питань, які потребують перевірки або відповіді.
          </Typography>
        </div>

        <AdminRefreshButton onClick={fetchModerationDashboard} isLoading={isLoading} />
      </Box>

      {error && (
        <div className="moderator-dashboard-alert">
          <ReportProblemOutlined />
          <span>{error}</span>
        </div>
      )}

      <section className="moderator-stat-grid" aria-label="Показники модерації">
        {statCards.map(({ title, value, note, icon: Icon, accent, to }) => (
          <button
            key={title}
            type="button"
            className={`moderator-stat-card is-${accent}`}
            onClick={() => navigate(to)}
          >
            <span className="moderator-stat-icon">
              <Icon />
            </span>
            <span className="moderator-stat-copy">
              <strong>{title}</strong>
              <small>{note}</small>
            </span>
            <span className="moderator-stat-value">{isLoading ? "..." : value}</span>
          </button>
        ))}
      </section>

      <section className="moderator-dashboard-grid">
        <article className="moderator-panel moderator-panel--queue">
          <div className="moderator-panel-head">
            <div>
              <h3>Черга модерації</h3>
              <p>Найсвіжіші відгуки та питання, з яких варто почати.</p>
            </div>
            <button
              type="button"
              className="moderator-panel-link"
              onClick={() => navigate("/admin/reviews?type=reviews&status=pending")}
            >
              Відкрити всі
            </button>
          </div>

          <div className="moderator-work-list">
            {queue.length === 0 ? (
              <div className="moderator-empty-state">
                <CheckCircleOutline />
                <span>Черга порожня</span>
                <small>Нових матеріалів для перевірки немає.</small>
              </div>
            ) : (
              queue.map(({ type, item }) => (
                <button
                  key={`${type}-${item._id}`}
                  type="button"
                  className={`moderator-work-item is-${type}`}
                  onClick={() => (type === "review" ? setSelectedReview(item) : setSelectedQuestion(item))}
                >
                  <span className="moderator-work-kind">
                    {type === "review" ? <RateReviewOutlined /> : <HelpOutlineOutlined />}
                  </span>
                  <span className="moderator-work-copy">
                    <strong>{getAuthorName(item)}</strong>
                    <small>{getProductName(item)}</small>
                    <em>{truncateText(getItemText(item))}</em>
                  </span>
                  <span className="moderator-work-date">
                    {formatModerationDetailsDate(item.createdAt)}
                  </span>
                  <VisibilityOutlined className="moderator-work-action" />
                </button>
              ))
            )}
          </div>
        </article>

        <aside className="moderator-side-stack">
          <article className="moderator-panel">
            <div className="moderator-panel-head">
              <div>
                <h3>Питання без відповіді</h3>
                <p>Конкретні звернення, які треба закрити відповіддю.</p>
              </div>
            </div>
            <div className="moderator-compact-list">
              {data.unansweredQuestions.length === 0 ? (
                <div className="moderator-compact-empty">Немає питань без відповіді.</div>
              ) : (
                data.unansweredQuestions.slice(0, 4).map((question) => (
                  <button
                    key={question._id}
                    type="button"
                    className="moderator-compact-item"
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <strong>{truncateText(question.text, 64)}</strong>
                    <span>{getProductName(question)}</span>
                  </button>
                ))
              )}
            </div>
          </article>

          <article className="moderator-panel">
            <div className="moderator-panel-head">
              <div>
                <h3>Найстаріші в черзі</h3>
                <p>Матеріали, які найдовше очікують реакції.</p>
              </div>
            </div>
            <div className="moderator-compact-list">
              {oldestQueue.length === 0 ? (
                <div className="moderator-compact-empty">Черга зараз порожня.</div>
              ) : (
                oldestQueue.map(({ type, item }) => (
                  <button
                    key={`oldest-${type}-${item._id}`}
                    type="button"
                    className="moderator-compact-item"
                    onClick={() => (type === "review" ? setSelectedReview(item) : setSelectedQuestion(item))}
                  >
                    <strong>{type === "review" ? "Відгук" : "Питання"}: {getAuthorName(item)}</strong>
                    <small>{getProductName(item)}</small>
                    <span>{truncateText(getItemText(item), 72)}</span>
                  </button>
                ))
              )}
            </div>
          </article>
        </aside>
      </section>

      <ReviewDetailsModal
        isOpen={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        review={selectedReview}
        isUpdating={isUpdating}
        onStatusChange={handleReviewStatusChange}
      />

      <QuestionDetailsModal
        isOpen={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestion(null)}
        question={selectedQuestion}
        isUpdating={isUpdating}
        onStatusChange={handleQuestionStatusChange}
        onOpenReply={handleOpenQuestionReply}
        onDelete={handleQuestionDeleteRequest}
      />

      <QuestionReplyDrawer
        isOpen={Boolean(selectedQuestionForAnswer)}
        onClose={() => setSelectedQuestionForAnswer(null)}
        question={selectedQuestionForAnswer}
        answerText={answerText}
        onAnswerTextChange={setAnswerText}
        isAnswering={isAnswering}
        onSubmit={handleAnswerSubmit}
      />

      <ConfirmModal
        isOpen={Boolean(questionDeleteTarget)}
        onClose={() => setQuestionDeleteTarget(null)}
        onConfirm={handleConfirmQuestionDelete}
        title="Видалення питання"
        message="Ви впевнені, що хочете видалити це питання? Цю дію не можна скасувати."
        confirmText="Видалити"
        cancelText="Скасувати"
        type="danger"
        confirmDisabled={isUpdating === questionDeleteTarget?._id}
      />
    </Box>
  );
};

export default ModeratorDashboard;
