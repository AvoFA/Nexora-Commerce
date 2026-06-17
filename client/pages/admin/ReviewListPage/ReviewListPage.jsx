import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";
import { toast } from "sonner";

import {
  getAdminReviews,
  updateReviewStatus,
} from "../../../services/reviewService";
import {
  getAdminQuestions,
  updateQuestionStatus,
  answerQuestion,
  deleteQuestion,
} from "../../../services/questionService";
import Pagination from "../../../components/common/Pagination/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal.jsx";

// Shared common controls
import AdminSearchInput from "../../../components/admin/common/AdminSearchInput.jsx";
import AdminRefreshButton from "../../../components/admin/common/AdminRefreshButton.jsx";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect.jsx";
import AdminFilterTabs from "../../../components/admin/common/AdminFilterTabs.jsx";

// Moderation components
import ModerationStats from "../../../components/admin/moderation/ModerationStats.jsx";
import ModerationTypeToggle from "../../../components/admin/moderation/ModerationTypeToggle.jsx";
import ReviewsTable from "../../../components/admin/moderation/ReviewsTable.jsx";
import QuestionsTable from "../../../components/admin/moderation/QuestionsTable.jsx";
import ReviewDetailsModal from "../../../components/admin/moderation/ReviewDetailsModal.jsx";
import QuestionDetailsModal from "../../../components/admin/moderation/QuestionDetailsModal.jsx";
import QuestionReplyDrawer from "../../../components/admin/moderation/QuestionReplyDrawer.jsx";

import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./ReviewListPage.scss";

const ModerationFiltersToolbar = ({
  activeType,
  localSearchInput,
  onSearchChange,
  onSearchClear,
  ratingFilter,
  onRatingChange,
  answerStatus,
  onAnswerStatusChange,
  sortBy,
  onSortChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="review-filters-toolbar">
      <AdminSearchInput
        value={localSearchInput}
        onChange={onSearchChange}
        onClear={onSearchClear}
        placeholder={
          activeType === "reviews"
            ? "Пошук за автором, email, товаром, текстом..."
            : "Пошук за запитанням, автором, товаром..."
        }
        disabled={isLoading}
      />

      <div className="toolbar-selects">
        {activeType === "reviews" ? (
          <CustomSelect
            label="Оцінка:"
            value={ratingFilter}
            onChange={onRatingChange}
            isLoading={isLoading}
            options={[
              { value: "all", label: "Всі оцінки" },
              { value: "5", label: "5 зірок" },
              { value: "4", label: "4 зірки" },
              { value: "3", label: "3 зірки" },
              { value: "2", label: "2 зірки" },
              { value: "1", label: "1 зірка" },
            ]}
          />
        ) : (
          <CustomSelect
            label="Відповідь:"
            value={answerStatus}
            onChange={onAnswerStatusChange}
            isLoading={isLoading}
            options={[
              { value: "all", label: "Всі" },
              { value: "unanswered", label: "Без відповіді" },
              { value: "answered", label: "Є відповідь" },
            ]}
          />
        )}

        <CustomSelect
          label="Сортування:"
          value={sortBy}
          onChange={onSortChange}
          isLoading={isLoading}
          options={
            activeType === "reviews"
              ? [
                  { value: "createdAt_desc", label: "Спочатку нові" },
                  { value: "createdAt_asc", label: "Спочатку старі" },
                  { value: "rating_desc", label: "Найвища оцінка" },
                  { value: "rating_asc", label: "Найнижча оцінка" },
                ]
              : [
                  { value: "createdAt_desc", label: "Спочатку нові" },
                  { value: "createdAt_asc", label: "Спочатку старі" },
                ]
          }
        />

        <AdminRefreshButton
          onClick={onRefresh}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

const ReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type") || "reviews";
  const activeFilter = searchParams.get("status") || "pending";
  const searchQuery = searchParams.get("q") || "";
  const ratingFilter = searchParams.get("rating") || "all";
  const answerStatus = searchParams.get("answerStatus") || "all";
  const sortBy = searchParams.get("sort") || "createdAt_desc";
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = parseInt(searchParams.get("limit"), 10) || 10;

  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);
  const [lastActiveTab, setLastActiveTab] = useState(null);

  // Quick reply drawer states
  const [selectedQuestionForAnswer, setSelectedQuestionForAnswer] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [questionDeleteTarget, setQuestionDeleteTarget] = useState(null);

  const [serverCounts, setServerCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [unansweredCount, setUnansweredCount] = useState(0);

  // Sync local search input with URL search query parameter
  useEffect(() => {
    setLocalSearchInput(searchQuery);
  }, [searchQuery]);

  // Debounced search synchronization
  useEffect(() => {
    if (localSearchInput === searchQuery) return;

    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          if (!localSearchInput.trim()) {
            prev.delete("q");
            if (lastActiveTab) {
              if (lastActiveTab === "pending") {
                prev.delete("status");
              } else {
                prev.set("status", lastActiveTab);
              }
            }
            setLastActiveTab(null);
          } else {
            if (!prev.get("q") && activeFilter !== "all") {
              setLastActiveTab(activeFilter);
              prev.set("status", "all");
            }
            prev.set("q", localSearchInput.trim());
          }
          prev.delete("page"); // Reset page to 1 on search
          return prev;
        },
        { replace: true },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [
    localSearchInput,
    searchQuery,
    activeFilter,
    lastActiveTab,
    setSearchParams,
  ]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        toast.error("Токен відсутній. Увійдіть в систему.");
        return;
      }

      if (activeType === "reviews") {
        const data = await getAdminReviews(token, {
          page,
          limit,
          status: activeFilter,
          search: searchQuery,
          rating: ratingFilter,
          sort: sortBy,
        });
        if (data.success) {
          setReviews(data.reviews || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 0);
          if (data.counts) {
            setServerCounts(data.counts);
          }
          if (data.avgRating !== undefined) {
            setAvgRating(data.avgRating);
          }
        }
      } else {
        const data = await getAdminQuestions(token, {
          page,
          limit,
          status: activeFilter,
          search: searchQuery,
          answerStatus,
          sort: sortBy,
        });
        if (data.success) {
          setQuestions(data.questions || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 0);
          if (data.counts) {
            setServerCounts(data.counts);
          }
          if (data.unansweredCount !== undefined) {
            setUnansweredCount(data.unansweredCount);
          }
        }
      }
    } catch (error) {
      toast.error(error.message || "Помилка завантаження даних");
      const isTokenError =
        error.message &&
        (error.message.includes("токен") ||
          error.message.includes("Токен") ||
          error.message.includes("token") ||
          error.message.includes("Token") ||
          error.message.includes("auth") ||
          error.message.includes("Auth"));
      if (isTokenError) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, activeType, activeFilter, searchQuery, ratingFilter, answerStatus, sortBy]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      
      let data;
      if (activeType === "reviews") {
        data = await updateReviewStatus(id, newStatus, token);
      } else {
        data = await updateQuestionStatus(id, newStatus, token);
      }

      if (data.success) {
        if (newStatus === "approved") {
          toast.success(
            activeType === "reviews"
              ? "Відгук успішно схвалено та опубліковано!"
              : "Запитання успішно схвалено та опубліковано!",
          );
        } else if (newStatus === "rejected") {
          toast.error(
            activeType === "reviews"
              ? "Відгук відхилено та знято з публікації."
              : "Запитання відхилено та знято з публікації.",
          );
        } else if (newStatus === "pending") {
          toast.info(
            activeType === "reviews"
              ? "Відгук успішно повернуто на модерацію."
              : "Запитання успішно повернуто на модерацію.",
          );
        }
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Помилка оновлення статусу");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleQuestionDelete = (id) => {
    const targetQuestion =
      selectedItemForModal?._id === id
        ? selectedItemForModal
        : questions.find((question) => question._id === id);

    setQuestionDeleteTarget(targetQuestion || { _id: id });
    return false;
  };

  const handleConfirmQuestionDelete = async () => {
    if (!questionDeleteTarget?._id) return;

    try {
      setIsUpdating(questionDeleteTarget._id);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await deleteQuestion(questionDeleteTarget._id, token);
      if (data.success) {
        toast.success("Запитання успішно видалено!");
        if (selectedItemForModal?._id === questionDeleteTarget._id) {
          setSelectedItemForModal(null);
        }
        setQuestionDeleteTarget(null);
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Помилка видалення запитання");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleTypeChange = (type) => {
    setSearchParams(
      (prev) => {
        if (type === "reviews") {
          prev.delete("type");
        } else {
          prev.set("type", type);
        }
        prev.delete("status"); // Reset to default (pending)
        prev.delete("q");
        prev.delete("page");
        prev.delete("rating");
        prev.delete("answerStatus");
        return prev;
      },
      { replace: true },
    );
    setLocalSearchInput("");
    setLastActiveTab(null);
  };

  const handleFilterChange = (status) => {
    setSearchParams(
      (prev) => {
        if (status === "pending") {
          prev.delete("status");
        } else {
          prev.set("status", status);
        }
        prev.delete("q"); // Clear search when switching tabs manually
        prev.delete("page"); // Reset page to 1
        return prev;
      },
      { replace: true },
    );
    setLastActiveTab(null);
  };

  const handleRatingChange = (newRating) => {
    setSearchParams(
      (prev) => {
        if (newRating === "all") {
          prev.delete("rating");
        } else {
          prev.set("rating", newRating);
        }
        prev.delete("page");
        return prev;
      },
      { replace: true },
    );
  };

  const handleAnswerStatusChange = (newAnswerStatus) => {
    setSearchParams(
      (prev) => {
        if (newAnswerStatus === "all") {
          prev.delete("answerStatus");
        } else {
          prev.set("answerStatus", newAnswerStatus);
        }
        prev.delete("page");
        return prev;
      },
      { replace: true },
    );
  };

  const handleSortChange = (newSort) => {
    setSearchParams(
      (prev) => {
        if (newSort === "createdAt_desc") {
          prev.delete("sort");
        } else {
          prev.set("sort", newSort);
        }
        prev.delete("page");
        return prev;
      },
      { replace: true },
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams(
      (prev) => {
        prev.set("page", newPage);
        return prev;
      },
      { replace: true },
    );
  };

  const handleLimitChange = (newLimit) => {
    setSearchParams(
      (prev) => {
        prev.set("limit", newLimit);
        prev.delete("page");
        return prev;
      },
      { replace: true },
    );
  };

  const handleInstantSearchClear = () => {
    setLocalSearchInput("");
    setSearchParams(
      (prev) => {
        prev.delete("q");
        prev.delete("page");
        if (lastActiveTab) {
          if (lastActiveTab === "pending") {
            prev.delete("status");
          } else {
            prev.set("status", lastActiveTab);
          }
        }
        setLastActiveTab(null);
        return prev;
      },
      { replace: true },
    );
  };

  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) {
      toast.error("Введіть текст відповіді");
      return;
    }
    try {
      setIsAnswering(true);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await answerQuestion(
        selectedQuestionForAnswer._id,
        answerText,
        token,
      );
      if (data.success) {
        toast.success("Відповідь успішно опубліковано!");
        setSelectedQuestionForAnswer(null);
        setAnswerText("");
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Помилка публікації відповіді");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleOpenQuestionReply = (question) => {
    setSelectedQuestionForAnswer(question);
    setAnswerText(question.answer || "");
  };

  const filterOptions = [
    { value: "pending", label: "На модерації" },
    { value: "approved", label: "Опубліковані" },
    { value: "rejected", label: "Відхилені" },
    { value: "all", label: "Усі" },
  ];

  return (
    <Box className="review-list-page">
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">
            Модерація {activeType === "reviews" ? "відгуків" : "запитань"}
          </Typography>
          <Typography variant="body2" className="subtitle" sx={{ color: "var(--text-secondary, #94a3b8)", opacity: 0.85, mt: 0.5 }}>
            Керування відгуками покупців та запитаннями про товари
          </Typography>
        </div>

        <ModerationStats
          activeType={activeType}
          avgRating={avgRating}
          unansweredCount={unansweredCount}
          allCount={serverCounts.all}
        />
      </Box>

      <div className="admin-solid-card moderation-toolbar-card">
        <div className="toolbar-header-row">
          <AdminFilterTabs
            activeTab={activeFilter}
            onChange={handleFilterChange}
            tabs={filterOptions}
            counts={serverCounts}
            ariaLabel="Статус модерації"
          />

          <ModerationTypeToggle
            activeType={activeType}
            onChange={handleTypeChange}
          />
        </div>

        <div className="toolbar-divider" />

        <ModerationFiltersToolbar
          activeType={activeType}
          localSearchInput={localSearchInput}
          onSearchChange={setLocalSearchInput}
          onSearchClear={handleInstantSearchClear}
          ratingFilter={ratingFilter}
          onRatingChange={handleRatingChange}
          answerStatus={answerStatus}
          onAnswerStatusChange={handleAnswerStatusChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onRefresh={fetchData}
          isLoading={isLoading}
        />
      </div>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="admin-table-container">
          <Table>
            <TableHead>
              {activeType === "reviews" ? (
                <TableRow>
                  <TableCell>Користувач</TableCell>
                  <TableCell>Товар</TableCell>
                  <TableCell>Оцінка</TableCell>
                  <TableCell>Відгук</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дії</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell>Користувач</TableCell>
                  <TableCell>Товар</TableCell>
                  <TableCell>Питання</TableCell>
                  <TableCell>Відповідь</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дії</TableCell>
                </TableRow>
              )}
            </TableHead>
            {activeType === "reviews" ? (
              <ReviewsTable
                reviews={reviews}
                searchQuery={searchQuery}
                isUpdating={isUpdating}
                onStatusChange={handleStatusChange}
                onViewDetails={setSelectedItemForModal}
              />
            ) : (
              <QuestionsTable
                questions={questions}
                searchQuery={searchQuery}
                onViewDetails={setSelectedItemForModal}
                onOpenReply={handleOpenQuestionReply}
              />
            )}
          </Table>
          {!isLoading && total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              isLoading={isLoading}
              itemLabel={activeType === "reviews" ? "відгуків" : "запитань"}
            />
          )}
        </TableContainer>
      )}

      {activeType === "reviews" && (
        <ReviewDetailsModal
          isOpen={Boolean(selectedItemForModal)}
          onClose={() => setSelectedItemForModal(null)}
          review={selectedItemForModal}
          isUpdating={isUpdating}
          onStatusChange={handleStatusChange}
        />
      )}

      {activeType === "questions" && (
        <QuestionDetailsModal
          isOpen={Boolean(selectedItemForModal)}
          onClose={() => setSelectedItemForModal(null)}
          question={selectedItemForModal}
          isUpdating={isUpdating}
          onStatusChange={handleStatusChange}
          onOpenReply={handleOpenQuestionReply}
          onDelete={handleQuestionDelete}
        />
      )}

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
        type="danger"
        icon={WarningAmber}
        title="Видалити це запитання?"
        message="Цю дію неможливо скасувати."
        confirmText="Видалити"
        cancelText="Скасувати"
        confirmDisabled={isUpdating === questionDeleteTarget?._id}
      />
    </Box>
  );
};

export default ReviewListPage;
