// Модальне вікно підтвердження видалення товару
import { useEffect } from 'react';
import { Box, Modal, Backdrop, Fade, Typography } from '@mui/material';
import { WarningAmber, Close } from '@mui/icons-material';
import './DeleteConfirmModal.scss';

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, productName }) => {
  // Закриття модалки по ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  return (
    <Modal
      open={isOpen}
      onClose={onCancel}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          className: 'delete-modal-backdrop',
        },
      }}
    >
      <Fade in={isOpen}>
        <Box className="delete-modal-wrapper">
          <div className="delete-modal-card">
            {/* Кнопка закриття */}
            <button
              className="delete-modal-close-btn"
              onClick={onCancel}
              aria-label="Закрити"
            >
              <Close />
            </button>

            {/* Іконка попередження */}
            <div className="delete-modal-icon">
              <WarningAmber sx={{ fontSize: 48 }} />
            </div>

            {/* Заголовок */}
            <Typography variant="h5" className="delete-modal-title">
              Видалити товар?
            </Typography>

            {/* Текст */}
            <Typography className="delete-modal-text">
              <strong>{productName}</strong> буде видалено назавжди.


            </Typography>

            {/* Кнопки */}
            <div className="delete-modal-actions">
              <button
                className="btn-secondary"
                onClick={onCancel}
              >
                Скасувати
              </button>
              <button
                className="btn-danger"
                onClick={onConfirm}
              >
                Видалити
              </button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default DeleteConfirmModal;
