import React, { useEffect, useRef } from "react";
import {
  statusLabelMap,
  terminalStatuses,
  allowedTransitionsMap,
  IS_TEST_MODE,
} from "./order.helpers";

const OrderStatusDropdown = ({
  status,
  onChange,
  disabled,
  isUpdating,
  isOpen,
  onToggle,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onToggle(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen, onToggle]);

  const currentLabel = statusLabelMap[status] || status;
  const isTerminalStatus = terminalStatuses.has(status);
  const isBtnDisabled =
    disabled || isUpdating || (IS_TEST_MODE ? false : isTerminalStatus);

  const handleToggle = (e) => {
    e.stopPropagation();
    const canToggle = IS_TEST_MODE ? true : !isTerminalStatus;
    if (canToggle && !isUpdating) {
      onToggle(!isOpen);
    }
  };

  const handleSelect = (key, e) => {
    e.stopPropagation();
    onToggle(false);
    onChange(key);
  };

  return (
    <div
      ref={dropdownRef}
      className={`status-dropdown ${isOpen ? "is-open" : ""} ${isTerminalStatus ? "is-terminal" : ""} ${isBtnDisabled ? "is-disabled" : ""}`}
    >
      <button
        type="button"
        className={`status-dropdown-trigger status-${status}`}
        onClick={handleToggle}
        disabled={isBtnDisabled}
      >
        <span className="trigger-label">{currentLabel}</span>
        {!isTerminalStatus && (
          <span className="chevron-wrapper">
            <svg
              className="chevron-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              width="12"
              height="12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </span>
        )}
      </button>
      {isOpen && (
        <div className="status-dropdown-menu">
          {Object.entries(statusLabelMap).map(([key, label]) => {
            const isSelected = key === status;
            const isAllowed = IS_TEST_MODE
              ? true
              : allowedTransitionsMap[status]?.includes(key);
            const isItemDisabled = !isSelected && !isAllowed;

            return (
              <button
                key={key}
                type="button"
                className={`status-dropdown-item item-${key} ${isSelected ? "is-selected" : ""} ${isItemDisabled ? "is-disabled" : ""}`}
                disabled={isItemDisabled}
                onClick={(e) => handleSelect(key, e)}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderStatusDropdown;
