import { useState, useRef, useEffect } from 'react';
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';
import './CancelOrderModal.scss';

const CANCEL_REASONS = [
  "Причину не обрано",
  "Передумав",
  "Помилково оформив",
  "Знайшов дешевше",
  "Неактуально",
  "Інше (напишіть)"
];

const LocalCustomSelect = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="local-custom-select-container" ref={containerRef}>
      {label && <label className="select-label">{label}</label>}
      <div 
        className={`select-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
            e.preventDefault();
          }
        }}
      >
        <span className="selected-value">{value}</span>
        <span className="select-chevron"><ExpandMoreIcon /></span>
      </div>
      {isOpen && (
        <ul className="select-dropdown-list">
          {options.map((opt) => (
            <li 
              key={opt} 
              className={`select-dropdown-item ${opt === value ? "active" : ""}`}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CancelOrderModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber
}) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm({ reason, comment });
    setReason(CANCEL_REASONS[0]);
    setComment("");
  };

  const handleClose = () => {
    setReason(CANCEL_REASONS[0]);
    setComment("");
    onClose();
  };

  const isOtherSelected = reason === "Інше (напишіть)";

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      className="cancel-order-modal"
      icon={null}
      title={`Скасувати замовлення ${orderNumber ? `№ ${orderNumber.slice(-6).toUpperCase()}` : ''}?`}
      confirmText="Скасувати замовлення"
      cancelText="Закрити"
      type="danger"
      confirmDisabled={reason === "Причину не обрано" || !reason || (isOtherSelected && !comment.trim())}
    >
      <div className="cancel-form-group">
        <LocalCustomSelect
          label="Вкажіть причину скасування *"
          value={reason}
          onChange={(val) => {
            setReason(val);
            if (val !== "Інше (напишіть)") {
              setComment("");
            }
          }}
          options={CANCEL_REASONS}
        />
      </div>

      {isOtherSelected && (
        <div className="cancel-form-group">
          <label htmlFor="cancel-comment">Опишіть причину *</label>
          <textarea
            id="cancel-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Знайшов товар в іншому магазині за нижчою ціною..."
            rows={3}
            className="cancel-textarea"
          />
        </div>
      )}
    </ConfirmModal>
  );
};

export default CancelOrderModal;
