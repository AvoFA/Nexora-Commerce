import { ChevronRight } from "@mui/icons-material";

const SelectedWarehouseSummary = ({
  id = "npBranch",
  branch,
  city,
  hasError = false,
  warehouseSummary,
  onOpen,
}) => {
  if (!branch) {
    return (
      <button
        id={id}
        type="button"
        className={`warehouse-select-trigger is-empty ${hasError ? "has-error" : ""}`}
        onClick={onOpen}
      >
        <span>Обрати відділення для: {city}</span>
        <ChevronRight className="warehouse-trigger-arrow" />
      </button>
    );
  }

  return (
    <button
      id={id}
      type="button"
      className={`selected-warehouse-summary ${hasError ? "has-error" : ""}`}
      onClick={onOpen}
    >
      <div className="summary-copy">
        <strong>{warehouseSummary.title}</strong>
        <small>{warehouseSummary.details}</small>
      </div>
      <span className="summary-change-btn">
        Змінити <ChevronRight className="warehouse-trigger-arrow" />
      </span>
    </button>
  );
};

export default SelectedWarehouseSummary;
