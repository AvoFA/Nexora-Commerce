const OrderCommentCard = ({ value, onChange }) => (
  <div className="checkout-card comment-card">
    <h2>Коментар до замовлення</h2>
    <div className="card-content">
      <div className="form-group full-width no-icon">
        <textarea
          id="order-comment"
          value={value}
          onChange={onChange}
          placeholder="Ваші побажання щодо доставки, часу отримання або додаткові деталі..."
          className="form-textarea"
          rows={4}
        />
      </div>
    </div>
  </div>
);

export default OrderCommentCard;
