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
  renderStars,
  statusColorMap,
  statusLabelMap,
} from "./moderation.helpers";

const ReviewDetailsModal = ({
  isOpen,
  onClose,
  review,
  isUpdating = null,
  onStatusChange,
}) => {
  if (!review) return null;

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
      <DialogTitle>Деталі відгуку</DialogTitle>
      <DialogContent dividers sx={{ pb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Двоколонкова спліт-панель: Товар ліворуч, Деталі праворуч */}
          <Box className="modal-header-split">
            {/* Ліва панель: Товар */}
            <Box className="product-panel">
              <Box className="product-image-container">
                <img
                  src={review.product?.image}
                  alt={review.product?.name}
                  className="product-full-image"
                />
              </Box>
              <Typography variant="body2" className="product-full-name">
                {review.product?.name || "Видалений товар"}
              </Typography>
            </Box>

            {/* Права панель: Метадані та Автор */}
            <Box className="details-panel">
              <Box className="author-card">
                <Box className="author-info">
                  <Typography variant="subtitle2" className="author-name">
                    {review.name}
                  </Typography>
                  {review.user?.email && (
                    <Typography variant="caption" className="author-email">
                      {review.user.email}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className="review-meta-list">
                <div className="meta-item">
                  <span className="meta-label">Оцінка:</span>
                  <span
                    className="meta-val"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {renderStars(review.rating)}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Дата створення:</span>
                  <span className="meta-val">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString(
                          "uk-UA",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        ) +
                        " " +
                        new Date(review.createdAt).toLocaleTimeString(
                          "uk-UA",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Невідомо"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Статус:</span>
                  <span className="meta-val">
                    <Chip
                      label={statusLabelMap[review.status]}
                      color={statusColorMap[review.status]}
                      size="small"
                      variant={review.status === "pending" ? "outlined" : "filled"}
                      sx={{
                        fontSize: "0.75rem",
                        height: "22px",
                        fontWeight: 600,
                        backgroundColor:
                          review.status === "approved"
                            ? "rgba(16, 185, 129, 0.15)"
                            : undefined,
                        color:
                          review.status === "approved"
                            ? "#10b981"
                            : undefined,
                        borderColor:
                          review.status === "pending"
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

          {/* Текст відгуку */}
          <div className="modal-section">
            <span className="section-label">Текст відгуку</span>
            <Typography
              variant="body2"
              className="section-content scrollable-text-box"
            >
              {review.text}
            </Typography>
          </div>

          {/* Переваги та недоліки */}
          {review.pros && (
            <div className="modal-section">
              <span className="section-label">Переваги</span>
              <Typography variant="body2" className="section-content pros-box">
                <b>+</b> {review.pros}
              </Typography>
            </div>
          )}
          {review.cons && (
            <div className="modal-section">
              <span className="section-label">Недоліки</span>
              <Typography variant="body2" className="section-content cons-box">
                <b>-</b> {review.cons}
              </Typography>
            </div>
          )}
        </Box>
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
        <Box sx={{ display: { xs: "none", sm: "block" } }} />

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            justifyContent: "center",
            gridColumn: { xs: "1", sm: "2" },
          }}
        >
          {review.status === "pending" && (
            <>
              <Button
                onClick={() => {
                  onStatusChange(review._id, "rejected");
                  onClose();
                }}
                variant="outlined"
                color="error"
                disabled={isUpdating === review._id}
              >
                Відхилити
              </Button>
              <Button
                onClick={() => {
                  onStatusChange(review._id, "approved");
                  onClose();
                }}
                variant="contained"
                color="success"
                disabled={isUpdating === review._id}
              >
                Схвалити
              </Button>
            </>
          )}

          {review.status === "approved" && (
            <Button
              onClick={() => {
                onStatusChange(review._id, "rejected");
                onClose();
              }}
              variant="outlined"
              color="error"
              disabled={isUpdating === review._id}
            >
              Зняти з публікації
            </Button>
          )}

          {review.status === "rejected" && (
            <Button
              onClick={() => {
                onStatusChange(review._id, "pending");
                onClose();
              }}
              variant="outlined"
              color="warning"
              disabled={isUpdating === review._id}
            >
              Повернути на модерацію
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
            gridColumn: { xs: "1", sm: "3" },
          }}
        >
          <Button
            onClick={onClose}
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
  );
};

export default ReviewDetailsModal;
