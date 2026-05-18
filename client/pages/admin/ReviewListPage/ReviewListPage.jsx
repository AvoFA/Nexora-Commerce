import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
  IconButton,
  Avatar,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Undo as UndoIcon,
  HighlightOff as HighlightOffIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import {
  getAdminReviews,
  updateReviewStatus,
} from "../../../services/reviewService";

import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./ReviewListPage.scss";

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

const statusLabelMap = {
  pending: "На модерації",
  approved: "Опубліковано",
  rejected: "Відхилено",
};

const ReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [selectedReviewForModal, setSelectedReviewForModal] = useState(null);
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        toast.error("Токен відсутній. Увійдіть в систему.");
        return;
      }
      const data = await getAdminReviews(token);
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      toast.error(error.message || "Помилка завантаження відгуків");
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
    fetchReviews();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const data = await updateReviewStatus(id, newStatus, token);
      if (data.success) {
        if (newStatus === "approved") {
          toast.success("Відгук успішно схвалено та опубліковано!");
        } else if (newStatus === "rejected") {
          toast.error("Відгук відхилено та знято з публікації.");
        } else if (newStatus === "pending") {
          toast.info("Відгук успішно повернуто на модерацію.");
        }

        // Оновлюємо стан локально
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)),
        );
      }
    } catch (error) {
      toast.error(error.message || "Помилка оновлення статусу");
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
      setIsUpdating(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <Rating
        value={Number(rating) || 0}
        readOnly
        size="small"
        sx={{
          "& .MuiRating-iconEmpty": { color: "#475569" },
        }}
      />
    );
  };

  // Розрахунок лічильників
  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    all: reviews.length,
  };

  // Фільтрація відгуків
  const filteredReviews = reviews.filter((review) => {
    if (activeFilter === "all") return true;
    return review.status === activeFilter;
  });

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
            Модерація відгуків
          </Typography>
          <Typography variant="body2" className="subtitle">
            Управління відгуками користувачів
          </Typography>
        </div>
      </Box>

      {/* Фільтри за статусом із лічильниками та статистика модерації справа */}
      <div className="admin-solid-card filter-card">
        <div className="filter-tabs">
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.value;
            const count = counts[option.value];
            return (
              <div
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`filter-tab-button ${isActive ? "active" : ""}`}
              >
                <span>{option.label}</span>
                <Chip label={count} size="small" />
              </div>
            );
          })}
        </div>

        {/* Компактна статистика модерації */}
        <Box className="moderation-stats-overview">
          <div className="stat-item all">
            <span className="stat-label">Всього</span>
            <span className="stat-value">{counts.all}</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-label">На модерації</span>
            <span className="stat-value">{counts.pending}</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-label">Опубліковано</span>
            <span className="stat-value">{counts.approved}</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-label">Відхилено</span>
            <span className="stat-value">{counts.rejected}</span>
          </div>
        </Box>
      </div>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="admin-table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Користувач</TableCell>
                <TableCell>Товар</TableCell>
                <TableCell>Оцінка</TableCell>
                <TableCell>Відгук</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Немає відгуків
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          className="user-name"
                        >
                          {review.name}
                        </Typography>
                        {review.user?.email && (
                          <Typography
                            variant="caption"
                            className="user-email"
                          >
                            {review.user.email}
                          </Typography>
                        )}
                        {review.createdAt && (
                          <Typography
                            variant="caption"
                            className="user-date"
                          >
                            {new Date(review.createdAt).toLocaleDateString(
                              "uk-UA",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={review.product?.image}
                          alt={review.product?.name}
                          variant="rounded"
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {review.product?.name || "Видалений товар"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Box
                        className="review-cell-interactive-wrapper"
                        onClick={() => setSelectedReviewForModal(review)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          className="review-text-clickable"
                          sx={{
                            maxWidth: 300,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                          }}
                        >
                          {review.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="review-more-link"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "#3b82f6",
                            fontWeight: 600,
                            mt: 0.75,
                          }}
                        >
                          <span className="text-label">Детальніше</span> <span className="arrow">➔</span>
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabelMap[review.status]}
                        color={statusColorMap[review.status]}
                        size="small"
                        variant={
                          review.status === "pending" ? "outlined" : "filled"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        {/* Дії для статусу pending (На модерації): Схвалити та Відхилити */}
                        {review.status === "pending" && (
                          <>
                            <Tooltip title="Схвалити">
                              <span>
                                <IconButton
                                  color="success"
                                  onClick={() =>
                                    handleStatusChange(review._id, "approved")
                                  }
                                  disabled={isUpdating === review._id}
                                  size="small"
                                >
                                  <CheckIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Відхилити">
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleStatusChange(review._id, "rejected")
                                  }
                                  disabled={isUpdating === review._id}
                                  size="small"
                                >
                                  <CloseIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}

                        {/* Дії для статусу approved (Опубліковані): Зняти з публікації */}
                        {review.status === "approved" && (
                          <Tooltip title="Зняти з публікації">
                            <span>
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleStatusChange(review._id, "rejected")
                                }
                                disabled={isUpdating === review._id}
                                size="small"
                              >
                                <HighlightOffIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}

                        {/* Дії для статусу rejected (Відхилені): Повернути на модерацію */}
                        {review.status === "rejected" && (
                          <Tooltip title="Повернути на модерацію">
                            <span>
                              <IconButton
                                color="warning"
                                onClick={() =>
                                  handleStatusChange(review._id, "pending")
                                }
                                disabled={isUpdating === review._id}
                                size="small"
                              >
                                <UndoIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Модальне вікно перегляду повних деталей відгуку */}
      <Dialog
        open={Boolean(selectedReviewForModal)}
        onClose={() => setSelectedReviewForModal(null)}
        className="review-detail-dialog"
        maxWidth="sm"
        fullWidth
      >
        <button
          onClick={() => setSelectedReviewForModal(null)}
          className="admin-modal-close-btn"
          aria-label="закрити"
        >
          <CloseIcon />
        </button>
        <DialogTitle>Деталі відгуку</DialogTitle>
        <DialogContent dividers sx={{ pb: 3 }}>
          {selectedReviewForModal && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Двоколонкова спліт-панель: Товар ліворуч, Деталі праворуч */}
              <Box className="modal-header-split">
                {/* Ліва панель: Товар (повне зображення без обрізання) */}
                <Box className="product-panel">
                  <Box className="product-image-container">
                    <img
                      src={selectedReviewForModal.product?.image}
                      alt={selectedReviewForModal.product?.name}
                      className="product-full-image"
                    />
                  </Box>
                  <Typography variant="body2" className="product-full-name">
                    {selectedReviewForModal.product?.name || "Видалений товар"}
                  </Typography>
                </Box>

                {/* Права панель: Метадані відгуку та Автор */}
                <Box className="details-panel">
                  {/* Автор */}
                  <Box className="author-card">
                    <Box className="author-info">
                      <Typography variant="subtitle2" className="author-name">
                        {selectedReviewForModal.name}
                      </Typography>
                      {selectedReviewForModal.user?.email && (
                        <Typography variant="caption" className="author-email">
                          {selectedReviewForModal.user.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Інформація про дату та статус */}
                  <Box className="review-meta-list">
                    <div className="meta-item">
                      <span className="meta-label">Оцінка:</span>
                      <span className="meta-val" style={{ display: 'flex', alignItems: 'center' }}>
                        {renderStars(selectedReviewForModal.rating)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Дата створення:</span>
                      <span className="meta-val">
                        {selectedReviewForModal.createdAt
                          ? new Date(
                              selectedReviewForModal.createdAt,
                            ).toLocaleDateString("uk-UA", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }) +
                            " " +
                            new Date(
                              selectedReviewForModal.createdAt,
                            ).toLocaleTimeString("uk-UA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Невідомо"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Статус:</span>
                      <span className="meta-val">
                        <Chip
                          label={statusLabelMap[selectedReviewForModal.status]}
                          color={statusColorMap[selectedReviewForModal.status]}
                          size="small"
                          variant={
                            selectedReviewForModal.status === "pending"
                              ? "outlined"
                              : "filled"
                          }
                          sx={{
                            fontSize: "0.75rem",
                            height: "22px",
                            fontWeight: 600,
                            backgroundColor: selectedReviewForModal.status === "approved" ? "rgba(16, 185, 129, 0.15)" : undefined,
                            color: selectedReviewForModal.status === "approved" ? "#10b981" : undefined,
                            borderColor: selectedReviewForModal.status === "pending" ? "rgba(245, 158, 11, 0.4)" : undefined,
                            "& .MuiChip-label": {
                              paddingLeft: "8px",
                              paddingRight: "8px",
                            }
                          }}
                        />
                      </span>
                    </div>
                  </Box>
                </Box>
              </Box>

              {/* Рядок 4: Повний текст відгуку */}
              <div className="modal-section">
                <span className="section-label">Текст відгуку</span>
                <Typography
                  variant="body2"
                  className="section-content scrollable-text-box"
                >
                  {selectedReviewForModal.text}
                </Typography>
              </div>

              {/* Рядок 5: Переваги та Недоліки */}
              {selectedReviewForModal.pros && (
                <div className="modal-section">
                  <span className="section-label">Переваги</span>
                  <Typography
                    variant="body2"
                    className="section-content pros-box"
                  >
                    <b>+</b> {selectedReviewForModal.pros}
                  </Typography>
                </div>
              )}
              {selectedReviewForModal.cons && (
                <div className="modal-section">
                  <span className="section-label">Недоліки</span>
                  <Typography
                    variant="body2"
                    className="section-content cons-box"
                  >
                    <b>-</b> {selectedReviewForModal.cons}
                  </Typography>
                </div>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
            gap: { xs: 1.5, sm: 0 },
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Ліва пуста колонка для математично бездоганного центрування дій */}
          <Box sx={{ display: { xs: "none", sm: "block" } }} />

          {/* Центральна колонка: кнопки швидкої модерації */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: "center",
              gridColumn: { xs: "1", sm: "2" },
            }}
          >
            {selectedReviewForModal && selectedReviewForModal.status === "pending" && (
              <>
                <Button
                  onClick={() => {
                    handleStatusChange(selectedReviewForModal._id, "rejected");
                    setSelectedReviewForModal(null);
                  }}
                  variant="outlined"
                  color="error"
                  disabled={isUpdating === selectedReviewForModal._id}
                >
                  Відхилити
                </Button>
                <Button
                  onClick={() => {
                    handleStatusChange(selectedReviewForModal._id, "approved");
                    setSelectedReviewForModal(null);
                  }}
                  variant="contained"
                  color="success"
                  disabled={isUpdating === selectedReviewForModal._id}
                >
                  Схвалити
                </Button>
              </>
            )}

            {selectedReviewForModal && selectedReviewForModal.status === "approved" && (
              <Button
                onClick={() => {
                  handleStatusChange(selectedReviewForModal._id, "rejected");
                  setSelectedReviewForModal(null);
                }}
                variant="outlined"
                color="error"
                disabled={isUpdating === selectedReviewForModal._id}
              >
                Зняти з публікації
              </Button>
            )}

            {selectedReviewForModal && selectedReviewForModal.status === "rejected" && (
              <Button
                onClick={() => {
                  handleStatusChange(selectedReviewForModal._id, "pending");
                  setSelectedReviewForModal(null);
                }}
                variant="outlined"
                color="warning"
                disabled={isUpdating === selectedReviewForModal._id}
              >
                Повернути на модерацію
              </Button>
            )}
          </Box>

          {/* Права колонка: кнопка Закрити на своєму місці */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              gridColumn: { xs: "1", sm: "3" },
            }}
          >
            <Button
              onClick={() => setSelectedReviewForModal(null)}
              variant="outlined"
              sx={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "var(--text-primary)",
              }}
            >
              Закрити
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewListPage;
