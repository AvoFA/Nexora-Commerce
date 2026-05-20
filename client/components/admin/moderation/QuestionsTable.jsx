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
  Visibility as VisibilityIcon,
  Reply as ReplyIcon,
} from "@mui/icons-material";
import {
  highlightMatch,
  statusColorMap,
  statusLabelMap,
} from "./moderation.helpers";

const QuestionsTable = ({
  questions = [],
  searchQuery = "",
  onViewDetails,
  onOpenReply,
}) => {
  return (
    <TableBody>
      {questions.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
            Немає запитань
          </TableCell>
        </TableRow>
      ) : (
        questions.map((question) => {
          const hasAnswer = question.answer && question.answer.trim();
          const replyActionLabel = hasAnswer ? "Редагувати відповідь" : "Відповісти";
          return (
            <TableRow key={question._id}>
              <TableCell>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography variant="body2" className="user-name">
                    {highlightMatch(question.name, searchQuery)}
                  </Typography>
                  {question.user?.email && (
                    <Typography variant="caption" className="user-email">
                      {highlightMatch(question.user.email, searchQuery)}
                    </Typography>
                  )}
                  {question.createdAt && (
                    <Typography variant="caption" className="user-date">
                      {new Date(question.createdAt).toLocaleDateString("uk-UA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={question.product?.image}
                    alt={question.product?.name}
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
                    {question.product?.name
                      ? highlightMatch(question.product.name, searchQuery)
                      : "Видалений товар"}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ maxWidth: 250 }}>
                <Box
                  className="review-cell-interactive-wrapper"
                  onClick={() => onViewDetails(question)}
                  sx={{ display: "flex", flexDirection: "column", width: "100%" }}
                >
                  <Typography
                    variant="body2"
                    className="review-text-clickable"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {highlightMatch(question.text, searchQuery)}
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
              <TableCell sx={{ maxWidth: 250 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Chip
                    label={hasAnswer ? "Є відповідь" : "Немає відповіді"}
                    className={`badge-answer-status ${hasAnswer ? "badge-answered" : "badge-unanswered"}`}
                    size="small"
                    sx={{ alignSelf: "flex-start", fontSize: "0.7rem", height: "20px" }}
                  />
                  {hasAnswer && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {highlightMatch(question.answer, searchQuery)}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={statusLabelMap[question.status]}
                  color={statusColorMap[question.status]}
                  size="small"
                  variant={question.status === "pending" ? "outlined" : "filled"}
                />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                  {/* Перегляд деталей */}
                  <Tooltip title="Перегляд">
                    <IconButton
                      size="small"
                      className="action-btn action-btn-view"
                      onClick={() => onViewDetails(question)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* Відповісти (Drawer) */}
                  <Tooltip title={replyActionLabel}>
                    <IconButton
                      size="small"
                      className="action-btn action-btn-reply"
                      aria-label={replyActionLabel}
                      onClick={() => onOpenReply(question)}
                    >
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                </Box>
              </TableCell>
            </TableRow>
          );
        })
      )}
    </TableBody>
  );
};

export default QuestionsTable;
