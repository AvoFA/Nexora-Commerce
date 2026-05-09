import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';
// import './ClearFavoritesConfirmModal.scss';

const ClearFavoritesConfirmModal = ({ isOpen, onClose, onConfirm, favoritesCount }) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      className="clear-favorites-modal"
      icon={DeleteForeverIcon}
      title="Підтвердження очищення"
      message="Ви впевнені, що хочете очистити всі улюблені товари?"
      warning="Буде видалено {count} товарів із вашого списку улюблених. Цю дію неможливо буде скасувати."
      confirmText="Очистити"
      cancelText="Скасувати"
      count={favoritesCount}
    />
  );
};

export default ClearFavoritesConfirmModal;
