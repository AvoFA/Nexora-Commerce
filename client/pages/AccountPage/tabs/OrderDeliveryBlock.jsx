const getDeliveryAddress = (delivery) => {
  const address = [delivery?.city, delivery?.address, delivery?.zip].filter(Boolean).join(", ");
  return address || "—";
};

const OrderDeliveryBlock = ({ order }) => {
  return (
    <div className="delivery-block">
      <div className="detail-block">
        <h4>Доставка</h4>
        <table className="info-table">
          <tbody>
            <tr>
              <td>Запланована дата видачі:</td>
              <td>{order.delivery?.plannedDate || "Уточнюється"}</td>
            </tr>
            <tr>
              <td>Вид доставки:</td>
              <td>{order.delivery?.type || "Доставка за адресою"}</td>
            </tr>
            <tr>
              <td>Адреса доставки:</td>
              <td>
                {getDeliveryAddress(order.delivery)}
                {order.delivery?.workHours && <small>{order.delivery.workHours}</small>}
              </td>
            </tr>
            <tr>
              <td>Отримувач:</td>
              <td>
                {order.customer?.name || order.customer?.phone || order.customer?.email ? (
                  <span className="delivery-recipient">
                    {order.customer?.name && (
                      <span className="delivery-recipient-name">{order.customer.name}</span>
                    )}
                    {order.customer?.phone && (
                      <span className="delivery-recipient-phone">{order.customer.phone}</span>
                    )}
                    {!order.customer?.phone && order.customer?.email && (
                      <span className="delivery-recipient-email">{order.customer.email}</span>
                    )}
                  </span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
            <tr>
              <td>Коментар до замовлення:</td>
              <td>
                <span className="order-comment-text" style={{ fontStyle: "italic", opacity: 0.9 }}>
                  {order.comment || "—"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDeliveryBlock;
