import React from "react";
import { hasDiff } from "../compare.utils.js";

const SpecRow = ({ label, values, showDiffOnly, totalCount }) => {
  const isDiff = hasDiff(values);
  if (showDiffOnly && !isDiff) return null;

  return (
    <div className={`cmp-spec-block${isDiff ? " cmp-spec-block--diff" : ""}`}>
      <div className="cmp-attrs__header">
        <span className="cmp-attrs__name">{label}</span>
      </div>
      <div className="cmp-attrs__values">
        {values.map((value, index) => (
          <div
            key={`${label}-${index}`}
            className={`cmp-attr-val${isDiff ? " cmp-attr-val--diff" : ""}`}
          >
            {value}
          </div>
        ))}
        {Array.from({ length: totalCount - values.length }).map(
          (_, index) => (
            <div
              key={`${label}-empty-${index}`}
              className="cmp-attr-val cmp-attr-val--empty"
            />
          ),
        )}
      </div>
    </div>
  );
};

export default SpecRow;
