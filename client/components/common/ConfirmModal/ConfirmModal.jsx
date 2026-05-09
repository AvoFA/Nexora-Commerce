import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
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
  count = null,
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  type = 'danger' // danger, warning, info
}) => {
  // Функція для заміни {count} в текстах
  const replaceCount = (text) => count !== null ? text.replace(/\{count\}/g, count) : text;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={`confirm-modal ${className}`}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle className="confirm-modal-title">
        {IconComponent && (
          <IconComponent className="confirm-modal-icon" />
        )}
        <span>{title}</span>
      </DialogTitle>

      <DialogContent className="confirm-modal-content">
        <p>{message}</p>
        {warning && (
          <p className="confirm-modal-warning">
            {replaceCount(warning)}
          </p>
        )}
      </DialogContent>

      <DialogActions className="confirm-modal-actions">
        <Button
          onClick={onClose}
          variant="outlined"
          className="confirm-modal-cancel-btn"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={type === 'danger' ? 'error' : 'primary'}
          className="confirm-modal-confirm-btn"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
