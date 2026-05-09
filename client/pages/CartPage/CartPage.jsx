// Сторінка кошика: список товарів, зміна кількості, підсумок

import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart.js";
import ClearCartConfirmModal from "../../components/common/ClearCartConfirmModal/ClearCartConfirmModal.jsx";
import { toast } from "sonner";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useState } from "react";
import "./CartPage.scss";

const CartPage = () => {
  // Отримуємо товари з глобального стану
  const { state, dispatch } = useCart();
  const { items } = state;
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Обробники кількості товарів
  const handleIncrease = (id) => {
    const itemToAdd = items.find((item) => item.id === id);
    if (itemToAdd) {
      dispatch({ type: "ADD_ITEM", payload: itemToAdd });
    }
  };

  const handleDecrease = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const handleRemove = (id, name) => {
    dispatch({ type: "CLEAR_ITEM", payload: id });
    toast.success(`"${name}" видалено з кошика`);
  };

  // Відкрити діалог очищення кошика
  const handleClearAllCart = () => {
    if (items.length === 0) return;
    setIsClearModalOpen(true);
  };

  // Підтвердити очищення кошика
  const confirmClearAllCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast.success('Кошик очищено!');
    setIsClearModalOpen(false);
  };

  // Закрити діалог
  const handleCloseClearModal = () => {
    setIsClearModalOpen(false);
  };

  // Рахуємо загальну вартість замовлення
  const totalPrice = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Рахуємо загальну кількість одиниць (не просто товарів, а штук)
  const totalItems = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  // Стан пустого кошика
  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty-state">
          <ShoppingBagOutlinedIcon className="empty-icon" />
          <h2>Ваш кошик порожній</h2>
          <p>Додайте товари, щоб розпочати покупки</p>
          <Link to="/catalog" className="btn-primary">
            Перейти до каталогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Ваш кошик</h1>
      <div className="cart-header">
        <p className="cart-items-count">
           Товарів у кошику <span className="cart-count-number">{totalItems}</span>
        </p>
        <button
          className="btn-danger btn-clear-cart"
          onClick={handleClearAllCart}
          title="Очистити увесь кошик"
        >
          <DeleteForeverIcon />
          Очистити увесь кошик
        </button>
      </div>

      <div className="cart-container">
        {/* Список товарів */}
        <div className="cart-items-list">
          {items.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
              </div>

              <div className="cart-item-details">
                <Link to={`/product/${item.id}`} className="cart-item-title">
                  {item.name}
                </Link>
                <p className="cart-item-price">{item.price} грн</p>
              </div>

              <div className="cart-item-controls">
                <button
                  onClick={() => handleRemove(item.id, item.name)}
                  className="cart-item-remove-btn"
                  title="Видалити товар"
                >
                  <DeleteForeverIcon fontSize="small" />
                </button>

                <div className="cart-item-quantity">
                  <button
                    onClick={() => handleDecrease(item.id)}
                    title="Зменшити"
                  >
                    <RemoveIcon fontSize="small" />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item.id)}
                    title="Збільшити"
                  >
                    <AddIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Підсумок замовлення */}
        <div className="cart-summary">
          <h2>Підсумок замовлення</h2>
          <div className="card-content">
            <div className="summary-row">
              <span>Вартість товарів:</span>
              <span>{totalPrice.toLocaleString("uk-UA")} грн</span>
            </div>
            <div className="summary-row">
              <span>Доставка:</span>
              <span>Безкоштовно</span>
            </div>

            <div className="summary-total">
              <strong>Всього до сплати:</strong>
              <strong>{totalPrice.toLocaleString("uk-UA")} грн</strong>
            </div>

            <Link to="/checkout" className="btn-checkout">
              Оформити замовлення
            </Link>
            <Link to="/catalog" className="btn-continue-shopping">
              Продовжити покупки
            </Link>
          </div>
        </div>
      </div>

      {/* Діалог підтвердження очищення кошика */}
      <ClearCartConfirmModal
        isOpen={isClearModalOpen}
        onClose={handleCloseClearModal}
        onConfirm={confirmClearAllCart}
        itemsCount={items.length}
      />
    </div>
  );
};

export default CartPage;
