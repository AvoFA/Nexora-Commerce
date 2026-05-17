// client/pages/CheckoutPage.jsx
import { useState, useEffect } from "react";
import { useCart } from "../../hooks/useCart.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createOrder } from "../../services/orderService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  PersonOutlined,
  EmailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LocationCityOutlined,
  MarkunreadMailboxOutlined,
  CreditCardOutlined,
  LocalShippingOutlined,
  ArrowBackIosNewOutlined,
} from "@mui/icons-material";
import "./CheckoutPage.scss";

const CheckoutPage = () => {
  const { state, dispatch } = useCart();
  const { items } = state;
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUserData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  /* === СТАН ФОРМИ === */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  /* === СПОСІБ ОПЛАТИ === */
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const getInputClassName = (value) => (
    `form-input ${String(value || "").trim() ? "is-filled" : "is-empty"}`
  );

  /* === ПЕРЕВІРКА, ЧИ КОШИК ПУСТИЙ === */
  useEffect(() => {
    if (items.length === 0 && !isOrderCompleted) {
      navigate("/cart");
    }
  }, [items, navigate, isOrderCompleted]);

  /* === ВІДПРАВКА ЗАМОВЛЕННЯ === */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Увійдіть або зареєструйтесь, щоб оформити замовлення");
      return;
    }

    if (!name || !email || !phone || !address || !city || !zip) {
      toast.error("Будь ласка, заповніть всі поля");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      await createOrder({
        items: items.map((item) => ({
          product: item._id || item.id,
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          image: item.image || item.imageUrl || "",
          quantity: item.quantity,
        })),
        customer: {
          name,
          email,
          phone,
        },
        delivery: {
          address,
          city,
          zip,
        },
        totalPrice,
        paymentMethod,
      }, token);

      setIsOrderCompleted(true);
      updateUserData?.({ phone });
      dispatch({ type: "CLEAR_CART" });

      toast.success("Дякуємо за замовлення!", {
        description: "Замовлення збережено у вашому кабінеті.",
        duration: 3000,
      });

      navigate("/account/orders");
    } catch (error) {
      toast.error(error.message || "Не вдалося оформити замовлення");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* === ЯКЩО КОШИК ПУСТИЙ === */
  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Ваш кошик порожній.</h2>
        <p>Перенаправляємо вас...</p>
      </div>
    );
  }

  /* === ОСНОВНА РОЗМІТКА === */
  return (
    <div className="checkout-page">
      <h1 className="page-title">Оформлення замовлення</h1>

      <form className="checkout-container" onSubmit={handleSubmit}>
        {/* === ЛІВА КОЛОНКА (ФОРМА) === */}
        <div className="checkout-form">
          {/* --- Контактна інформація --- */}
          <div className="checkout-card">
            <h2>Контактна інформація</h2>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="name">Ім'я та Прізвище</label>
                <PersonOutlined className="form-icon" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Іван Петренко"
                  className={getInputClassName(name)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <EmailOutlined className="form-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className={getInputClassName(email)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Номер телефону</label>
                <PhoneOutlined className="form-icon" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+380 99 123 4567"
                  className={getInputClassName(phone)}
                  required
                />
              </div>
            </div>
          </div>

          {/* --- Адреса доставки --- */}
          <div className="checkout-card">
            <h2>Адреса доставки</h2>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="address">Адреса</label>
                <HomeOutlined className="form-icon" />
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Вул. Хрещатик, 1"
                  className={getInputClassName(address)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">Місто</label>
                <LocationCityOutlined className="form-icon" />
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Київ"
                  className={getInputClassName(city)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="zip">Поштовий індекс</label>
                <MarkunreadMailboxOutlined className="form-icon" />
                <input
                  id="zip"
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="01001"
                  className={getInputClassName(zip)}
                  required
                />
              </div>
            </div>
          </div>

          {/* --- Оплата --- */}
          <div className="checkout-card">
            <h2>Оплата</h2>
            <div className="card-content">
              <div className="payment-options-group">
                <label className="payment-option-card">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <LocalShippingOutlined />
                    <span>Оплата при отриманні</span>
                  </div>
                </label>

                <label className="payment-option-card">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <CreditCardOutlined />
                    <span>Картою онлайн</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* === ПРАВА КОЛОНКА (ПІДСУМОК) === */}
        <div className="checkout-summary">
          <h2>Ваше замовлення</h2>
          <div className="card-content">
            <div className="summary-items">
              {items.map((item) => (
                <div key={item._id || item.id} className="summary-item">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <strong>{item.price * item.quantity} ₴</strong>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <strong>Всього до сплати:</strong>
              <strong>{totalPrice.toLocaleString("uk-UA")} ₴</strong>
            </div>

            {/* --- Кнопка оформлення --- */}
            <button type="submit" className="btn-checkout-submit" disabled={isSubmitting}>
              {isSubmitting ? "Створюємо замовлення..." : "Підтвердити замовлення"}
            </button>

            {/* --- НОВА КНОПКА: Назад до кошика --- */}
            <button
              type="button"
              className="btn-back-to-cart"
              onClick={() => navigate("/cart")}
            >
              <ArrowBackIosNewOutlined fontSize="small" />
              Назад до кошика
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
