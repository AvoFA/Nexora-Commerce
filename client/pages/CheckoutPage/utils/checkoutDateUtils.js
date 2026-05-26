import {
  DELIVERY_METHODS,
  UKRAINIAN_MONTH_LABELS,
  UKRAINIAN_WEEKDAY_LABELS,
  UKRAINIAN_WEEKDAY_SHORT_LABELS,
} from "../checkout.constants.js";

export const getStartOfToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const getDateByOffset = (daysToAdd) => {
  const date = getStartOfToday();
  date.setDate(date.getDate() + daysToAdd);
  return date;
};

export const getOffsetByDate = (date) => {
  const today = getStartOfToday();
  const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((selected - today) / 86400000);
};

export const getDateParts = (daysToAdd) => {
  const date = getDateByOffset(daysToAdd);
  const day = date.getDate();
  const month = UKRAINIAN_MONTH_LABELS[date.getMonth()];
  const weekday = UKRAINIAN_WEEKDAY_LABELS[date.getDay()];
  const weekdayShort = UKRAINIAN_WEEKDAY_SHORT_LABELS[date.getDay()];

  return {
    dayMonth: `${day} ${month}`,
    weekday,
    weekdayShort,
    full: `${day} ${month} (${weekday})`,
    numeric: date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
};

export const getFormattedDate = (daysToAdd) => {
  return getDateParts(daysToAdd).full;
};

export const getPlannedDate = (deliveryMethod, selectedDeliveryDateOffset, chosenStore, npBranch, address) => {
  if (deliveryMethod === DELIVERY_METHODS.PICKUP) return `самовивіз, ${getFormattedDate(selectedDeliveryDateOffset)}`;
  if (deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA || deliveryMethod === DELIVERY_METHODS.MEEST) return `до відділення, ${getFormattedDate(selectedDeliveryDateOffset)}`;
  return `кур'єром, ${getFormattedDate(selectedDeliveryDateOffset)}`;
};

export const getDefaultDateOffset = (method) => (method === DELIVERY_METHODS.PICKUP ? 1 : 2);

export const getDeliveryDateOffsets = (deliveryMethod) => {
  const firstOffset = getDefaultDateOffset(deliveryMethod);
  return [firstOffset, firstOffset + 1, firstOffset + 2, firstOffset + 3];
};

export const getDeliveryCalendarDays = (deliveryCalendarMonth, deliveryMethod, selectedDeliveryDateOffset) => {
  const year = deliveryCalendarMonth.getFullYear();
  const month = deliveryCalendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const offset = getOffsetByDate(date);

    return {
      date,
      offset,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isSelected: offset === selectedDeliveryDateOffset,
      isDisabled: offset < getDefaultDateOffset(deliveryMethod),
    };
  });
};

export const getMethodHeaderDate = (method, deliveryMethod, selectedDeliveryDateOffset) => {
  const offset = deliveryMethod === method ? selectedDeliveryDateOffset : getDefaultDateOffset(method);
  return getFormattedDate(offset);
};
