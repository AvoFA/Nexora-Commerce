import React, { useState, useEffect } from 'react';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';
// import './ClearCartConfirmModal.scss';

const ClearCartConfirmModal = ({ isOpen, onClose, onConfirm, itemsCount }) => {
  const [persistedCount, setPersistedCount] = useState(itemsCount);

  useEffect(() => {
    if (isOpen) {
      setPersistedCount(itemsCount);
    }
  }, [isOpen, itemsCount]);

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      className="clear-cart-modal"
      icon={DeleteForeverIcon}
      title="Підтвердження очищення"
      message="Ви впевнені, що хочете очистити кошик?"
      warning="Буде видалено {count} товарів із вашого кошика. Цю дію неможливо буде скасувати."
      confirmText="Очистити"
      cancelText="Скасувати"
      count={persistedCount}
    />
  );
};

export default ClearCartConfirmModal;
