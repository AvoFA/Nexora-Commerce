import React from "react";
import {
  TableBody,
  TableCell,
  TableRow,
  Box,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Undo as UndoIcon,
} from "@mui/icons-material";
import {
  highlightMatch,
  formatModerationListDate,
  renderStars,
  statusColorMap,
  statusLabelMap,
} from "./moderation.helpers";

const ReviewsTable = ({
  reviews = [],
  searchQuery = "",
  isUpdating = null,
  onStatusChange,
  onViewDetails,
}) => {
  return (
    <TableBody>
      {reviews.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
            Немає відгуків
          </TableCell>
        </TableRow>
      ) : (
        reviews.map((review) => (
          <TableRow key={review._id}>
            <TableCell>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="body2" className="user-name">
                  {highlightMatch(review.name, searchQuery)}
                </Typography>
                {review.user?.email && (
                  <Typography variant="caption" className="user-email">
                    {highlightMatch(review.user.email, searchQuery)}
                  </Typography>
                )}
                {review.createdAt && (
                  <Typography variant="caption" className="user-date">
                    {formatModerationListDate(review.createdAt)}
                  </Typography>
                )}
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  {review.product?.name
                    ? highlightMatch(review.product.name, searchQuery)
                    : "Видалений товар"}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>{renderStars(review.rating)}</TableCell>
            <TableCell sx={{ maxWidth: 300 }}>
              <Box
                className="review-cell-interactive-wrapper"
                onClick={() => onViewDetails(review)}
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
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
                  {highlightMatch(review.text, searchQuery)}
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
                  <span className="text-label">Детальніше</span>{" "}
                  <span className="arrow">➔</span>
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Chip
                label={statusLabelMap[review.status]}
                color={statusColorMap[review.status]}
                size="small"
                variant={review.status === "pending" ? "outlined" : "filled"}
              />
            </TableCell>
            <TableCell align="right">
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                {review.status === "pending" && (
                  <>
                    <Tooltip title="Схвалити">
                      <span>
                        <IconButton
                          className="action-btn action-btn-approve"
                          onClick={() => onStatusChange(review._id, "approved")}
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
                          className="action-btn action-btn-reject"
                          onClick={() => onStatusChange(review._id, "rejected")}
                          disabled={isUpdating === review._id}
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )}
                {review.status === "approved" && (
                  <Tooltip title="Зняти з публікації">
                    <span>
                      <IconButton
                        className="action-btn action-btn-reject"
                        onClick={() => onStatusChange(review._id, "rejected")}
                        disabled={isUpdating === review._id}
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {review.status === "rejected" && (
                  <Tooltip title="Повернути на модерацію">
                    <span>
                      <IconButton
                        className="action-btn action-btn-undo"
                        onClick={() => onStatusChange(review._id, "pending")}
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
  );
};

export default ReviewsTable;
