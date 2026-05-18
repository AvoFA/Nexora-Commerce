import { CreditCardOutlined, LocalShippingOutlined, ChevronRight } from "@mui/icons-material";
import PaymentOptionCard from "../PaymentOptionCard/PaymentOptionCard.jsx";
import { PAYMENT_METHODS } from "../../../pages/CheckoutPage/checkout.constants.js";

const PaymentSection = ({ paymentMethod, onPaymentMethodChange, onContinue }) => (
  <div className="step-section-wrapper">
    <div className="checkout-card">
      <h2>Вибір способу оплати</h2>
      <div className="card-content">
        <div className="payment-options-group">
          <PaymentOptionCard
            value={PAYMENT_METHODS.CASH}
            selectedValue={paymentMethod}
            icon={<LocalShippingOutlined />}
            title="Оплата при отриманні"
            description="Готівкою або карткою у точці видачі / кур'єру"
            onChange={onPaymentMethodChange}
          />

          <PaymentOptionCard
            value={PAYMENT_METHODS.CARD}
            selectedValue={paymentMethod}
            icon={<CreditCardOutlined />}
            title="Картою онлайн"
            description="Миттєва безпечна оплата Visa / Mastercard / Apple Pay"
            onChange={onPaymentMethodChange}
          />
        </div>

        <div className="step-actions left-aligned" style={{ marginTop: "24px" }}>
          <button
            type="button"
            className="btn-continue-step"
            onClick={onContinue}
          >
            Продовжити <ChevronRight className="arrow-continue" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentSection;
