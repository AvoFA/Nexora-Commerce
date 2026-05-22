import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  formatModerationDetailsDate,
  statusColorMap,
  statusLabelMap,
} from "./moderation.helpers";

const QuestionDetailsModal = ({
  isOpen,
  onClose,
  question,
  isUpdating = null,
  onStatusChange,
  onOpenReply,
  onDelete,
}) => {
  if (!question) return null;

  const hasAnswer = question.answer && question.answer.trim();

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="review-detail-dialog"
      maxWidth="sm"
      fullWidth
    >
      <button
        onClick={onClose}
        className="admin-modal-close-btn"
        aria-label="закрити"
      >
        <CloseIcon />
      </button>
      <DialogTitle>Деталі запитання</DialogTitle>
      <DialogContent dividers sx={{ pb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Двоколонкова спліт-панель: Товар ліворуч, Деталі праворуч */}
          <Box className="modal-header-split">
            {/* Ліва панель: Товар */}
            <Box className="product-panel">
              <Box className="product-image-container">
                <img
                  src={question.product?.image}
                  alt={question.product?.name}
                  className="product-full-image"
                />
              </Box>
              <Typography variant="body2" className="product-full-name">
                {question.product?.name || "Видалений товар"}
              </Typography>
            </Box>

            {/* Права панель: Метадані та Автор */}
            <Box className="details-panel">
              <Box className="author-card">
                <Box className="author-info">
                  <Typography variant="subtitle2" className="author-name">
                    {question.name}
                  </Typography>
                  {question.user?.email && (
                    <Typography variant="caption" className="author-email">
                      {question.user.email}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className="review-meta-list">
                <div className="meta-item">
                  <span className="meta-label">Відповідь:</span>
                  <span className="meta-val">
                    <Chip
                      label={hasAnswer ? "Є відповідь" : "Немає відповіді"}
                      className={`badge-answer-status ${hasAnswer ? "badge-answered" : "badge-unanswered"}`}
                      size="small"
                    />
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Дата створення:</span>
                  <span className="meta-val">
                    {formatModerationDetailsDate(question.createdAt)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Статус:</span>
                  <span className="meta-val">
                    <Chip
                      label={statusLabelMap[question.status]}
                      color={statusColorMap[question.status]}
                      size="small"
                      variant={question.status === "pending" ? "outlined" : "filled"}
                      sx={{
                        fontSize: "0.75rem",
                        height: "22px",
                        fontWeight: 600,
                        backgroundColor:
                          question.status === "approved"
                            ? "rgba(16, 185, 129, 0.15)"
                            : undefined,
                        color:
                          question.status === "approved"
                            ? "#10b981"
                            : undefined,
                        borderColor:
                          question.status === "pending"
                            ? "rgba(245, 158, 11, 0.4)"
                            : undefined,
                        "& .MuiChip-label": {
                          paddingLeft: "8px",
                          paddingRight: "8px",
                        },
                      }}
                    />
                  </span>
                </div>
              </Box>
            </Box>
          </Box>

          {/* Текст запитання */}
          <div className="modal-section">
            <span className="section-label">Текст запитання</span>
            <Typography
              variant="body2"
              className="section-content scrollable-text-box"
            >
              {question.text}
            </Typography>
          </div>

          {/* Відповідь адміністратора */}
          <div className="modal-section">
            <span className="section-label">Відповідь адміністратора</span>
            <Typography
              variant="body2"
              className="section-content scrollable-text-box"
              sx={{
                fontStyle: !question.answer ? "italic" : "normal",
                color: !question.answer ? "var(--text-secondary)" : "inherit",
              }}
            >
              {question.answer || "Немає відповіді на це запитання."}
            </Typography>
          </div>

          <Box className="question-modal-secondary-action">
            <Button
              onClick={async () => {
                const wasDeleted = await onDelete(question._id);
                if (wasDeleted) {
                  onClose();
                }
              }}
              variant="text"
              color="error"
              disabled={isUpdating === question._id}
              size="small"
            >
              Видалити
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box
          className="question-modal-workflow-actions"
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {question.status === "pending" && (
            <Button
              onClick={() => {
                onStatusChange(question._id, "rejected");
                onClose();
              }}
              variant="outlined"
              color="error"
              disabled={isUpdating === question._id}
            >
              Відхилити
            </Button>
          )}

          {question.status === "approved" && (
            <Button
              onClick={() => {
                onStatusChange(question._id, "rejected");
                onClose();
              }}
              variant="outlined"
              color="error"
              disabled={isUpdating === question._id}
            >
              Зняти з публікації
            </Button>
          )}

          {question.status === "rejected" && (
            <Button
              onClick={() => {
                onStatusChange(question._id, "pending");
                onClose();
              }}
              variant="outlined"
              color="warning"
              disabled={isUpdating === question._id}
            >
              Повернути на модерацію
            </Button>
          )}

          <Button
            onClick={() => {
              onClose();
              onOpenReply(question);
            }}
            variant="contained"
            color="primary"
            disabled={isUpdating === question._id}
          >
            {hasAnswer ? "Редагувати відповідь" : "Відповісти"}
          </Button>

          {question.status === "pending" && (
            <Button
              onClick={() => {
                onStatusChange(question._id, "approved");
                onClose();
              }}
              variant="contained"
              color="success"
              disabled={isUpdating === question._id}
            >
              Схвалити
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDetailsModal;
