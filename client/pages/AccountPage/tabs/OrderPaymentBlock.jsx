import { formatPrice } from "../../../utils/formatPrice.js";
import { PAYMENT_LABELS } from "./orders.constants.js";

const OrderPaymentBlock = ({ order, itemCount, itemsTotal, deliveryPrice, totalPrice }) => {
  return (
    <div className="payment-block">
      <div className="detail-block">
        <h4>Оплата</h4>
        <table className="payment-table">
          <tbody>
            <tr>
              <td>Спосіб оплати:</td>
              <td>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—"}</td>
            </tr>
            <tr>
              <td>Товар ({itemCount}):</td>
              <td>{formatPrice(itemsTotal)}</td>
            </tr>
            <tr>
              <td>Доставка:</td>
              <td className={deliveryPrice > 0 ? "" : "free"}>
                {deliveryPrice > 0 ? formatPrice(deliveryPrice) : "Безкоштовно"}
              </td>
            </tr>
            <tr className="total-row">
              <td>Всього:</td>
              <td>{formatPrice(totalPrice)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderPaymentBlock;
