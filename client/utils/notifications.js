export const APP_NOTIFICATION_EVENT = 'app:notification';

const notify = (detail) => {
  window.dispatchEvent(new CustomEvent(APP_NOTIFICATION_EVENT, { detail }));
};

export const getAnchorRect = (event) => {
  const rect = event?.currentTarget?.getBoundingClientRect?.();
  if (!rect) return null;

  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
};

export const showCompareAddedToast = (anchor = null) => {
  notify({
    kind: 'compare-added',
    title: 'Товар додано до порівняння',
    actionLabel: 'До порівняння',
    actionTo: '/compare',
    duration: 3200,
    anchor
  });
};

export const showCompareExistsToast = (anchor = null) => {
  notify({
    kind: 'compare-info',
    title: 'Товар уже є в порівнянні',
    duration: 2600,
    anchor
  });
};

export const showCompareRemovedToast = (anchor = null) => {
  notify({
    kind: 'compare-info',
    title: 'Видалено з порівняння',
    duration: 2200,
    anchor
  });
};
