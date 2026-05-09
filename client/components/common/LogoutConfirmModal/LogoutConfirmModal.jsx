import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';
// import './LogoutConfirmModal.scss';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      className="logout-modal"
      icon={ErrorOutlineIcon}
      title="Підтвердження виходу"
      message="Ви впевнені, що хочете вийти з акаунта?"
      warning="Ваш список улюблених товарів буде збережено."
      confirmText="Вийти"
      cancelText="Скасувати"
      type="warning"
    />
  );
};

export default LogoutConfirmModal;
