// Модальне вікно для входу та реєстрації користувачів
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'sonner';
import './AuthModal.scss';
import {
  Close as CloseIcon,
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

// Основний компонент модального вікна авторизації
const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loading, error } = useAuth();

  // Стан UI
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Стан форм
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Скидання форми при відкритті модалки
  useEffect(() => {
    if (isOpen) {
      setTab('login');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLoginData({ email: '', password: '' });
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  // Блокування прокрутки фону при відкритому вікні
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обробник зміни даних форми входу
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Обробник зміни даних форми реєстрації
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  // Якщо модалка закрита, не рендеримо нічого (оптимізація)
  if (!isOpen) return null;

  // Обробка входу
  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      toast.success('Успішний вхід!');
      onClose();
    }
  };

  // Обробка реєстрації
  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Паролі не співпадають!');
      return;
    }

    const result = await register(registerData.email, registerData.name, registerData.password);
    if (result.success) {
      toast.success('Акаунт створено успішно!');
      onClose();
    }
  };

  return (
    // Оверлей модального вікна з розмитим фоном
    <div className="auth-modal-overlay" onClick={onClose}>
      {/* Контейнер модалки - запобігає закриттю при кліку всередині */}
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Обгортка для кращого позиціонування */}
        <div className="auth-wrapper">
          {/* Перемикач вкладок */}
          <div className="auth-tabs">
            <button
              className={tab === "login" ? "active" : ""}
              onClick={() => setTab("login")}
            >
              Вхід
            </button>
            <button
              className={tab === "register" ? "active" : ""}
              onClick={() => setTab("register")}
            >
              Реєстрація
            </button>
          </div>

          {/* Основна картка модалки з формою */}
          <div className="auth-card">
            {/* Кнопка закриття модалки */}
            <button className="auth-modal-close" onClick={onClose}>
              <CloseIcon />
            </button>

            {/* Динамічний заголовок */}
            <div className="auth-card-header">
              <h2 className="auth-card-title">
                {tab === "login" ? "З поверненням!" : "Створити акаунт"}
              </h2>
              <p className="auth-card-description">
                {tab === "login"
                  ? "Увійдіть у свій акаунт, щоб продовжити."
                  : "Зареєструйтесь, щоб почати покупки."}
              </p>
            </div>

            {/* Відображення помилки якщо є */}
            {error && (
              <div className="error-message" style={{color: '#ff4757', textAlign: 'center', marginBottom: '1rem'}}>
                {error}
              </div>
            )}

            {/* Контент з формами */}
            <div className="auth-card-content">
              {/* Форма авторизації */}
              <div className={`auth-form ${tab === "login" ? "active" : ""}`}>
                <form onSubmit={handleLogin}>
                  {/* Група поля email з іконкою */}
                  <div className="form-group">
                    <label>Email</label>
                    <EmailOutlined className="form-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="ivanenko@example.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  {/* Група поля пароля з перемикачем видимості */}
                  <div className="form-group">
                    <label>Пароль</label>
                    <LockOutlined className="form-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>

                  {/* Посилання на відновлення пароля */}
                  <a
                    href="#"
                    className="forgot-password-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Forgot password flow");
                    }}
                  >
                    Забули пароль?
                  </a>

                  {/* Кнопка відправки форми входу */}
                  <button
                    type="submit"
                    className="auth-button btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Входимо..." : "Увійти"}
                  </button>
                </form>
              </div>

              {/* Форма реєстрації - показується тільки при активній вкладці register */}
              <div
                className={`auth-form ${tab === "register" ? "active" : ""}`}
              >
                <form onSubmit={handleRegister}>
                  {/* Особисті дані */}
                  <div className="form-group">
                    <label>Повне ім'я</label>
                    <PersonOutlined className="form-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Іван Петренко"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  {/* Поле email */}
                  <div className="form-group">
                    <label>Email</label>
                    <EmailOutlined className="form-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="ivanenko@example.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  {/* Поле пароля */}
                  <div className="form-group">
                    <label>Пароль</label>
                    <LockOutlined className="form-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>

                  {/* Поле підтвердження пароля */}
                  <div className="form-group">
                    <label>Підтвердіть пароль</label>
                    <LockOutlined className="form-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>

                  {/* Кнопка відправки форми реєстрації */}
                  <button
                    type="submit"
                    className="auth-button btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Створюємо..." : "Створити акаунт"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
