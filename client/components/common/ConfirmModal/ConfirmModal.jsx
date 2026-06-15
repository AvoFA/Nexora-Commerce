import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmModal.scss';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  className = '',
  icon: IconComponent = null,
  title,
  message,
  warning = null,
  info = null,
  count = null,
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  type = 'danger', // danger, warning, info
  confirmDisabled = false,
  children
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const replaceCount = (text) => count !== null ? text.replace(/\{count\}/g, count) : text;

  return createPortal(
    <div className={`confirm-modal-overlay ${className}`} onClick={onClose}>
      <div className="confirm-modal-paper" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-title">
          {IconComponent && (
            <IconComponent className="confirm-modal-icon" />
          )}
          <span>{title}</span>
        </div>

        <div className="confirm-modal-content">
          <p>{message}</p>
          {warning && (
            <p className="confirm-modal-warning">
              {replaceCount(warning)}
            </p>
          )}
          {info && (
            <p className="confirm-modal-info">
              {replaceCount(info)}
            </p>
          )}
          {children}
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="confirm-modal-cancel-btn"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`confirm-modal-confirm-btn confirm-modal-confirm-btn--${type}`}
            disabled={confirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
