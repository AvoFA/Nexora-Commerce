const UK_LOCALE = "uk-UA";

export const formatDate = (date, options, fallback = "—") => {
  if (!date) return fallback;

  return new Date(date).toLocaleDateString(UK_LOCALE, options);
};

export const formatTime = (date, options, fallback = "") => {
  if (!date) return fallback;

  return new Date(date).toLocaleTimeString(UK_LOCALE, options);
};

export const formatDateTime = (
  date,
  dateOptions,
  timeOptions,
  fallback = "—",
) => {
  if (!date) return fallback;

  return `${formatDate(date, dateOptions, fallback)} ${formatTime(
    date,
    timeOptions,
    "",
  )}`.trim();
};
