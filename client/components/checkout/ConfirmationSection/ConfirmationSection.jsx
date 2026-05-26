import { CheckCircle, ChevronRight } from "@mui/icons-material";
import OrderCommentCard from "../OrderCommentCard/OrderCommentCard.jsx";

const ConfirmationSection = ({
  deliveryTypeLabel,
  deliveryAddress,
  courierAddress,
  plannedDate,
  paymentLabel,
  recipientName,
  recipientPhone,
  comment,
  onCommentChange,
  onEditDelivery,
  onEditPayment,
}) => (
  <div className="step-section-wrapper">
    <div className="checkout-card confirmation-card">
      <div className="card-content confirmation-vertical-list">
        <div className="confirmation-row">
          <div className="row-left">
            <CheckCircle className="check-icon" />
          </div>
          <div className="row-middle">
            <h3>Доставка</h3>
            <p className="row-text">{deliveryTypeLabel}</p>
            <p className="row-subtext">
              {deliveryAddress}
              {courierAddress}
            </p>
            <p className="row-delivery-date">
              Очікувана дата доставки <strong>{plannedDate}</strong>
            </p>
          </div>
          <div className="row-right">
            <button
              type="button"
              className="btn-change-row"
              onClick={onEditDelivery}
            >
              <span>Змінити</span>
              <ChevronRight className="arrow-icon" />
            </button>
          </div>
        </div>

        <div className="confirmation-row">
          <div className="row-left">
            <CheckCircle className="check-icon" />
          </div>
          <div className="row-middle">
            <h3>Оплата</h3>
            <p className="row-text">{paymentLabel}</p>
          </div>
          <div className="row-right">
            <button
              type="button"
              className="btn-change-row"
              onClick={onEditPayment}
            >
              <span>Змінити</span>
              <ChevronRight className="arrow-icon" />
            </button>
          </div>
        </div>

        <div className="confirmation-row">
          <div className="row-left">
            <CheckCircle className="check-icon" />
          </div>
          <div className="row-middle">
            <h3>Одержувач замовлення</h3>
            <p className="row-text">{recipientName}</p>
            <p className="row-subtext">{recipientPhone}</p>
          </div>
          <div className="row-right">
            <button
              type="button"
              className="btn-change-row"
              onClick={onEditDelivery}
            >
              <span>Змінити</span>
              <ChevronRight className="arrow-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <OrderCommentCard value={comment} onChange={onCommentChange} />
  </div>
);

export default ConfirmationSection;
