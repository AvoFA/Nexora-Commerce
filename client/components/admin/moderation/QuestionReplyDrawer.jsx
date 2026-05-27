import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const QuestionReplyDrawer = ({
  isOpen,
  onClose,
  question,
  answerText,
  onAnswerTextChange,
  isAnswering,
  onSubmit,
}) => {
  if (!question) return null;

  const hasAnswer = question.answer && question.answer.trim();
  const title = hasAnswer ? "Редагувати відповідь" : "Написати відповідь";
  const submitLabel = hasAnswer ? "Оновити" : "Опублікувати";

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        className: "quick-reply-drawer",
        sx: {
          width: { xs: "100%", sm: 450 },
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "var(--text-primary)",
          padding: 3.5,
          boxSizing: "border-box",
          borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            pb: 1.5,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {title}
            </Typography>
            <Chip
              label={hasAnswer ? "Є відповідь" : "Немає відповіді"}
              className={`badge-answer-status ${hasAnswer ? "badge-answered" : "badge-unanswered"}`}
              size="small"
            />
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ color: "var(--text-secondary)" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 0.5, display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box className="drawer-product-info" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={question.product?.image}
              alt={question.product?.name}
              variant="rounded"
              sx={{
                width: 64,
                height: 64,
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            />
            <Box>
              <Typography variant="caption" sx={{ color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                Товар
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                {question.product?.name}
              </Typography>
            </Box>
          </Box>

          <Box className="drawer-author-info">
            <Typography variant="caption" sx={{ color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", display: "block", mb: 0.5 }}>
              Автор запитання
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {question.name}
            </Typography>
            {question.user?.email && (
              <Typography variant="caption" sx={{ color: "var(--text-secondary)" }}>
                {question.user.email}
              </Typography>
            )}
          </Box>

          <Box className="drawer-question-text" sx={{ p: 2, borderRadius: "12px", backgroundColor: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
            <Typography variant="caption" sx={{ color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", display: "block", mb: 1 }}>
              Запитання
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic", color: "var(--text-primary)", lineHeight: 1.4 }}>
              "{question.text}"
            </Typography>
          </Box>

          <Box className="drawer-reply-input" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="caption" sx={{ color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Ваша відповідь
            </Typography>
            <textarea
              className="admin-textarea"
              rows={6}
              placeholder="Введіть текст офіційної відповіді адміністратора..."
              value={answerText}
              onChange={(e) => onAnswerTextChange(e.target.value)}
            />
            <Typography variant="caption" className="drawer-answer-hint">
              Публікація відповіді автоматично схвалить питання
            </Typography>
          </Box>
        </Box>

        <Box
          className="quick-reply-drawer-footer"
          sx={{
            display: "flex",
            gap: 2,
            pt: 2.5,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            mt: "auto",
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={isAnswering}
            sx={{
              borderColor: "rgba(255,255,255,0.15)",
              color: "var(--text-primary)",
            }}
          >
            Скасувати
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disabled={isAnswering}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isAnswering ? <CircularProgress size={24} color="inherit" /> : submitLabel}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default QuestionReplyDrawer;
