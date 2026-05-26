import { useState } from "react";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const ProductSpecsTable = ({ attributes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const safeAttributes = attributes || [];

  const activeGroups = safeAttributes.filter(
    (group) => group.groupName && group.items && group.items.some((item) => item.key && item.key.trim() !== "")
  );

  const allSpecs = activeGroups.flatMap((group) =>
    (group.items || []).filter((item) => item.key && item.key.trim() !== "")
  );

  const showToggle = activeGroups.length > 1 || allSpecs.length > 5;

  return (
    <section className="characteristics-section">
      <h2 className="section-title">
        {isExpanded && showToggle ? "Основні характеристики" : "Характеристики"}
      </h2>

      <div className="specs-table-box">
        {isExpanded || !showToggle ? (
          activeGroups.map((group, groupIdx) => {
            const groupSpecs = (group.items || []).filter(
              (item) => item.key && item.key.trim() !== ""
            );

            return (
              <div key={groupIdx} className="specs-table-group">
                <div className="group-header">{group.groupName}</div>
                <div className="group-rows">
                  {groupSpecs.map((spec, idx) => (
                    <div key={idx} className="spec-row-grid">
                      <div className="spec-key">{spec.key}</div>
                      <div className="spec-value">{spec.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="specs-table-group">
            <div className="group-rows">
              {allSpecs.slice(0, 5).map((spec, idx) => (
                <div key={idx} className="spec-row-grid">
                  <div className="spec-key">{spec.key}</div>
                  <div className="spec-value">{spec.value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeGroups.length === 0 && (
          <div style={{ opacity: 0.5, padding: "20px 0", textAlign: "center" }}>
            Характеристики для цього товару відсутні.
          </div>
        )}
      </div>

      {showToggle && (
        <div className="specs-toggle-container">
          <button
            className="specs-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <span>Згорнути характеристики</span>
                <ExpandLess sx={{ fontSize: "18px" }} />
              </>
            ) : (
              <>
                <span>Показати всі характеристики</span>
                <ExpandMore sx={{ fontSize: "18px" }} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductSpecsTable;
