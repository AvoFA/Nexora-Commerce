import React from "react";
import { Box } from "@mui/material";
import {
  Star as StarIcon,
  Comment as CommentIcon,
  HelpOutline as HelpOutlineIcon,
  QuestionAnswer as QuestionAnswerIcon,
} from "@mui/icons-material";

const ModerationStats = ({
  activeType,
  avgRating,
  unansweredCount,
  allCount,
}) => {
  return (
    <Box className="moderation-header-stats">
      {activeType === "reviews" ? (
        <>
          <div className="stat-card rating">
            <div className="stat-icon-wrapper">
              <StarIcon className="star-icon" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Сер. оцінка</span>
              <span className="stat-value">
                {Number(avgRating || 0).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="stat-card all">
            <div className="stat-icon-wrapper">
              <CommentIcon className="comment-icon" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Всього відгуків</span>
              <span className="stat-value">{allCount || 0}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="stat-card unanswered">
            <div className="stat-icon-wrapper">
              <HelpOutlineIcon className="unanswered-icon" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Без відповіді</span>
              <span className="stat-value">{unansweredCount || 0}</span>
            </div>
          </div>
          <div className="stat-card all">
            <div className="stat-icon-wrapper">
              <QuestionAnswerIcon className="question-icon" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Всього запитань</span>
              <span className="stat-value">{allCount || 0}</span>
            </div>
          </div>
        </>
      )}
    </Box>
  );
};

export default ModerationStats;
