import React from "react";
import { Comment as CommentIcon, HelpOutline as HelpOutlineIcon } from "@mui/icons-material";

const ModerationTypeToggle = ({ activeType, onChange }) => {
  return (
    <div className="moderation-type-toggle">
      <button
        type="button"
        className={`toggle-btn ${activeType === "reviews" ? "active" : ""}`}
        onClick={() => onChange("reviews")}
      >
        <CommentIcon className="toggle-icon" />
        Відгуки
      </button>
      <button
        type="button"
        className={`toggle-btn ${activeType === "questions" ? "active" : ""}`}
        onClick={() => onChange("questions")}
      >
        <HelpOutlineIcon className="toggle-icon" />
        Питання
      </button>
    </div>
  );
};

export default ModerationTypeToggle;
