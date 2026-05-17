import { Link } from "react-router-dom";
import { Inventory2Outlined } from "@mui/icons-material";

const OrderEmptyState = ({ state, error, onRetry, onResetFilter }) => {
  if (state === "unauthenticated") {
    return (
      <div className="orders-board-empty">
        <Inventory2Outlined sx={{ fontSize: 48 }} />
        <h2>Увійдіть, щоб переглянути замовлення</h2>
        <p>Після входу тут з'явиться історія ваших покупок, статуси та деталі доставки.</p>
        <Link to="/catalog" className="btn-primary">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  if (state === "loading") {
    return <div className="orders-board-empty orders-board-empty-compact">Завантаження замовлень...</div>;
  }

  if (state === "error") {
    return (
      <div className="orders-board-empty">
        <Inventory2Outlined sx={{ fontSize: 48 }} />
        <h2>Помилка завантаження</h2>
        <p>{error}</p>
        <button className="btn-secondary" type="button" onClick={onRetry}>
          Спробувати знову
        </button>
      </div>
    );
  }

  if (state === "no-orders") {
    return (
      <div className="orders-board-empty">
        <Inventory2Outlined sx={{ fontSize: 48 }} />
        <h2>У вас поки що немає замовлень</h2>
        <p>Оформіть першу покупку, і вона з'явиться в цьому розділі.</p>
        <Link to="/catalog" className="btn-primary">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  if (state === "no-filtered") {
    return (
      <div className="orders-board-empty">
        <Inventory2Outlined sx={{ fontSize: 48 }} />
        <h2>У цьому розділі немає замовлень</h2>
        <p>Змініть фільтр або поверніться до всіх замовлень.</p>
        <button className="btn-secondary" type="button" onClick={onResetFilter}>
          Показати всі
        </button>
      </div>
    );
  }

  return null;
};

export default OrderEmptyState;
