import React from "react";
import { Inventory2Outlined } from "@mui/icons-material";

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
  ready_for_pickup: "Відправлено",
  received: "Отримано",
  cancelled: "Скасовано",
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

export const IS_TEST_MODE = true;

export const getOrderNumber = (order) => {
  const raw = order?._id || "";
  return raw ? `#${raw.slice(-6).toUpperCase()}` : "—";
};

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const highlightMatch = (text, query) => {
  if (!text) return "";
  if (!query || !query.trim()) return text;

  const trimmedQuery = query.trim();
  const parts = String(text).split(
    new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi"),
  );

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

export const formatOrderDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatOrderTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("uk-UA", {
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
