import React from "react";
import { Inventory2Outlined } from "@mui/icons-material";
import { formatDate, formatTime } from "../../../utils/dateFormatters";

export const statusColorMap = {
  new: "info",
  confirmed: "primary",
  packing: "warning",
  ready_for_pickup: "secondary",
  received: "success",
  cancelled: "error",
};

export const statusLabelMap = {
  new: "Нове",
  confirmed: "Підтверджено",
  packing: "Комплектується",
  ready_for_pickup: "Готово до отримання",
  received: "Отримано",
  cancelled: "Скасовано",
};

export const statusBadgeClassMap = {
  new: "badge-new",
  confirmed: "badge-confirmed",
  packing: "badge-packing",
  ready_for_pickup: "badge-ready",
  received: "badge-received",
  cancelled: "badge-cancelled",
};

export const cancellationSourceLabelMap = {
  customer: "Клієнт",
  admin: "Адмін",
};

export const cancellationHistoryLabelMap = {
  customer: "Скасовано клієнтом",
  admin: "Скасовано адміністратором",
};

export const terminalStatuses = new Set(["received", "cancelled"]);

export const allowedTransitionsMap = {
  new: ["confirmed", "cancelled"],
  confirmed: ["packing", "cancelled"],
  packing: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["received", "cancelled"],
  received: [],
  cancelled: [],
};

export const IS_TEST_MODE = false;

export const getOrderNumber = (order) => {
  const raw = order?._id || "";
  return raw ? `#${raw.slice(-6).toUpperCase()}` : "—";
};

export const getCancellationSourceLabel = (order) => {
  if (order?.status !== "cancelled") return "";

  return cancellationSourceLabelMap[order.cancellation?.cancelledBy] || "";
};

export const getHistoryStatusLabel = (entry) => {
  if (entry?.status === "cancelled" && entry.changedBy) {
    return cancellationHistoryLabelMap[entry.changedBy] || statusLabelMap.cancelled;
  }

  return statusLabelMap[entry?.status] || entry?.status;
};

export const getStatusLabel = (status) => statusLabelMap[status] || status;

export const getStatusBadgeClass = (status) => statusBadgeClassMap[status] || "";

export { escapeRegExp, highlightMatch } from "../../../utils/searchHighlight";


export const formatOrderDate = (date) => {
  return formatDate(date, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatOrderTime = (date) => {
  return formatTime(date, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getItemsTotal = (order) =>
  (order.items || []).reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  );

export const getOrderTotal = (order) =>
  Number(order.totalPrice) || getItemsTotal(order);

export const getDeliveryAddress = (delivery) =>
  [delivery?.city, delivery?.address, delivery?.zip]
    .filter(Boolean)
    .join(", ") || "—";

export const getItemKey = (order, item, index) => {
  const productId = item.product?._id || item.product || item._id || index;
  return `${order._id}-${productId}-${index}`;
};

export const renderProductThumb = (item, className = "") => {
  if (item?.image) {
    return <img src={item.image} alt={item.name || "Товар"} />;
  }

  return <Inventory2Outlined className={className} />;
};
