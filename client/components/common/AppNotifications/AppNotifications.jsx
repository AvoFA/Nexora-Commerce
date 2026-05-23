import { useEffect, useMemo, useState } from "react";
import { Close } from "@mui/icons-material";
import { APP_NOTIFICATION_EVENT } from "../../../utils/notifications.js";
import { navigateTo } from "../../../utils/authModalEvents.js";
import "./AppNotifications.scss";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPosition = (notification) => {
  const width = 360;
  const gap = 10;
  const margin = 16;
  const anchor = notification?.anchor;

  if (!anchor) {
    return {
      top: 92,
      right: 24
    };
  }

  const top = clamp(anchor.bottom + gap, margin, window.innerHeight - 120);
  const left = clamp(anchor.right - width, margin, window.innerWidth - width - margin);

  return { top, left };
};

const AppNotifications = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleNotification = (event) => {
      setNotification({
        id: Date.now(),
        ...event.detail
      });
    };

    window.addEventListener(APP_NOTIFICATION_EVENT, handleNotification);

    return () => {
      window.removeEventListener(APP_NOTIFICATION_EVENT, handleNotification);
    };
  }, []);

  useEffect(() => {
    if (!notification) return undefined;

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, notification.duration || 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notification]);

  const position = useMemo(() => getPosition(notification), [notification]);

  if (!notification) return null;

  const handleAction = (event) => {
    event.preventDefault();
    setNotification(null);
    navigateTo(notification.actionTo);
  };

  return (
    <div
      className={`app-notification app-notification--${notification.kind || "info"}`}
      style={{
        ...position,
        "--notification-duration": `${notification.duration || 3000}ms`
      }}
      role="status"
      aria-live="polite"
    >
      <div className="app-notification__content">
        <div className="app-notification__text">{notification.title}</div>
        {notification.actionLabel && notification.actionTo && (
          <a
            className="app-notification__action"
            href={notification.actionTo}
            onClick={handleAction}
          >
            {notification.actionLabel}
          </a>
        )}
      </div>

      <button
        type="button"
        className="app-notification__close"
        onClick={() => setNotification(null)}
        aria-label="Закрити сповіщення"
      >
        <svg className="app-notification__timer" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <circle className="app-notification__timer-track" cx="17" cy="17" r="15" />
          <circle className="app-notification__timer-progress" cx="17" cy="17" r="15" />
        </svg>
        <Close className="app-notification__close-icon" />
      </button>
    </div>
  );
};

export default AppNotifications;
