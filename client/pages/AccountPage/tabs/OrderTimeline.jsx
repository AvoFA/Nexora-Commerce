import {
  ORDER_STEPS,
  STATUS_LABELS,
  STATUS_DESCRIPTIONS,
  TIMELINE_LABELS,
} from "./orders.constants.js";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCompletedSteps = (order) => {
  if (order.status === "cancelled") return new Set(["cancelled"]);

  const currentIndex = ORDER_STEPS.indexOf(order.status);
  const activeSteps = currentIndex >= 0
    ? ORDER_STEPS.slice(0, currentIndex + 1)
    : ["new"];

  return new Set(activeSteps);
};

const OrderTimeline = ({ order }) => {
  const completedSteps = getCompletedSteps(order);
  const steps = order.status === "cancelled" ? ["cancelled"] : ORDER_STEPS;

  return (
    <div className="status-timeline-block">
      <div className="order-timeline">
        {steps.map((status) => {
          const historyEntry = order.history?.find((entry) => entry.status === status);
          const isActive = completedSteps.has(status);

          return (
            <div
              key={`${order._id}-${status}`}
              className={`order-timeline-item${isActive ? " active" : ""}`}
            >
              <span className="timeline-label">{TIMELINE_LABELS[status] || STATUS_LABELS[status]}</span>
              <span className="timeline-time">
                {historyEntry ? formatDate(historyEntry.timestamp) : STATUS_DESCRIPTIONS[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
