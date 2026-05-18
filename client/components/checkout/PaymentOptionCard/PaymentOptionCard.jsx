import { CheckCircle } from "@mui/icons-material";

const PaymentOptionCard = ({
  value,
  selectedValue,
  name = "paymentMethod",
  icon,
  title,
  description,
  onChange,
}) => {
  const isSelected = selectedValue === value;

  return (
    <label className={`payment-option-card ${isSelected ? "selected" : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={onChange}
      />
      <div className="payment-option-content">
        {icon}
        <div className="payment-option-text">
          <span>{title}</span>
          <small>{description}</small>
        </div>
      </div>
      {isSelected && <CheckCircle className="payment-select-check" />}
    </label>
  );
};

export default PaymentOptionCard;
