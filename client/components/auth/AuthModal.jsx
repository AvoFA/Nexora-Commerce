import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config/api.js';
import './AuthModal.scss';
import {
  Close as CloseIcon,
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { validateEmail, validateNamePart } from '../../utils/userValidation.js';

const initialLoginData = {
  email: '',
  password: '',
};

const initialRegisterData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loading, error, clearError } = useAuth();
  const firstInputRef = useRef(null);

  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState(initialLoginData);
  const [registerData, setRegisterData] = useState(initialRegisterData);
  const [fieldErrors, setFieldErrors] = useState({});

  // Forgot password flow states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const passwordsMatch = useMemo(() => {
    if (!registerData.password || !registerData.confirmPassword) return null;
    return registerData.password === registerData.confirmPassword;
  }, [registerData.password, registerData.confirmPassword]);

  const forgotPasswordsMatch = useMemo(() => {
    if (!forgotPassword || !forgotConfirmPassword) return null;
    return forgotPassword === forgotConfirmPassword;
  }, [forgotPassword, forgotConfirmPassword]);

  useEffect(() => {
    if (!isOpen) return;

    setTab('login');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoginData(initialLoginData);
    setRegisterData(initialRegisterData);
    setForgotEmail('');
    setForgotStep(1);
    setForgotCode('');
    setForgotPassword('');
    setForgotConfirmPassword('');
    setForgotLoading(false);
    setLocalError(null);
    setFieldErrors({});
    if (clearError) clearError();

    window.setTimeout(() => firstInputRef.current?.focus(), 0);
  }, [isOpen]); // Removed clearError from dependencies

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setForgotEmail('');
    setForgotStep(1);
    setForgotCode('');
    setForgotPassword('');
    setForgotConfirmPassword('');
    setForgotLoading(false);
    setLocalError(null);
    if (clearError) clearError();
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateLogin = () => {
    const errors = {};
    const emailError = validateEmail(loginData.email);
    if (emailError) errors.email = emailError;
    if (!loginData.password) errors.password = 'Вкажіть пароль.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = () => {
    const errors = {};
    const nameError = validateNamePart(registerData.name);
    const emailError = validateEmail(registerData.email);
    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (!registerData.password) errors.password = 'Створіть пароль.';
    if (!registerData.confirmPassword) errors.confirmPassword = 'Повторіть пароль.';
    if (
      registerData.password &&
      registerData.confirmPassword &&
      registerData.password !== registerData.confirmPassword
    ) {
      errors.confirmPassword = 'Паролі не співпадають.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateLogin()) return;

    const result = await login(loginData.email.trim().toLowerCase(), loginData.password);
    if (result.success) {
      toast.success('Успішний вхід!');
      onClose();
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!validateRegister()) return;

    const result = await register(
      registerData.email.trim().toLowerCase(),
      registerData.name.trim(),
      registerData.password
    );
    if (result.success) {
      toast.success('Акаунт створено успішно!');
      onClose();
    }
  };

  const handleForgotEmailSubmit = async (event) => {
    event.preventDefault();
    const emailError = validateEmail(forgotEmail);
    if (emailError) {
      setLocalError(emailError);
      return;
    }
    setLocalError(null);
    setForgotLoading(true);

    try {
      toast.success('Код підтвердження надіслано!');
      setForgotStep(2);
    } catch (err) {
      setLocalError(err.message || 'Помилка надсилання коду.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!forgotCode) errors.forgotCode = 'Введіть код підтвердження.';
    if (!forgotPassword) {
      errors.forgotPassword = 'Створіть новий пароль.';
    } else if (forgotPassword.length < 6) {
      errors.forgotPassword = 'Пароль має містити не менше 6 символів.';
    }
    if (forgotPassword !== forgotConfirmPassword) {
      errors.forgotConfirmPassword = 'Паролі не співпадають.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setForgotLoading(true);
    setLocalError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          code: forgotCode.trim(),
          newPassword: forgotPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Не вдалося скинути пароль.');
      }

      toast.success('Пароль успішно змінено! Тепер ви можете увійти.');
      switchTab('login');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onMouseDown={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-modal-top-bar">
              <div className="auth-logo-mark" aria-hidden="true">
                <img src="/assets/logo/nexora-symbol.svg" alt="" />
              </div>
              <button
                type="button"
                className="auth-modal-close"
                onClick={onClose}
                aria-label="Закрити вікно авторизації"
              >
                <CloseIcon />
              </button>
            </div>

            {(error || (tab === 'forgot' && localError)) && (
              <div className="error-message" role="alert" style={{ marginTop: '20px', marginBottom: '0' }}>
                {tab === 'forgot' ? localError : error}
              </div>
            )}

            <div className="auth-card-content">
              <div className="auth-header-text">
                <h2 className="auth-card-title" id="auth-modal-title">
                  {tab === 'login' && 'З поверненням!'}
                  {tab === 'register' && 'Створити акаунт'}
                  {tab === 'forgot' && 'Відновлення пароля'}
                </h2>
                <p className="auth-card-description" id="auth-modal-description">
                  {tab === 'login' && 'Увійдіть, щоб швидше оформляти замовлення.'}
                  {tab === 'register' && 'Створіть профіль для замовлень, обраного та історії.'}
                  {tab === 'forgot' && (forgotStep === 1 ? 'Вкажіть ваш email для отримання коду підтвердження.' : 'Введіть код підтвердження та новий пароль.')}
                </p>
              </div>
              <div
                id="auth-panel-login"
                className={`auth-form ${tab === 'login' ? 'active' : ''}`}
                hidden={tab !== 'login'}
              >
                <form onSubmit={handleLogin} noValidate>
                  <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
                    <label htmlFor="login-email">Email</label>
                    <EmailOutlined className="form-icon" aria-hidden="true" />
                    <input
                      ref={firstInputRef}
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder="ivanenko@example.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      autoComplete="email"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                      required
                    />
                    {fieldErrors.email && (
                      <span className="field-error" id="login-email-error">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  <div className={`form-group ${fieldErrors.password ? 'has-error' : ''}`}>
                    <label htmlFor="login-password">Пароль</label>
                    <LockOutlined className="form-icon" aria-hidden="true" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      autoComplete="current-password"
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((isVisible) => !isVisible)}
                      aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                    {fieldErrors.password && (
                      <span className="field-error" id="login-password-error">
                        {fieldErrors.password}
                      </span>
                    )}
                  </div>

                  <p className="forgot-password-link-container">
                    <button type="button" className="forgot-password-link" onClick={() => switchTab('forgot')}>
                      Забули пароль?
                    </button>
                  </p>

                  <button type="submit" className="auth-button btn-primary" disabled={loading}>
                    {loading ? 'Входимо...' : 'Увійти'}
                  </button>

                  <p className="auth-switch-text">
                    Немає акаунта?
                    <button type="button" onClick={() => switchTab('register')}>
                      Створити акаунт
                    </button>
                  </p>
                </form>
              </div>

              <div
                id="auth-panel-register"
                className={`auth-form ${tab === 'register' ? 'active' : ''}`}
                hidden={tab !== 'register'}
              >
                <form onSubmit={handleRegister} noValidate>
                  <div className={`form-group ${fieldErrors.name ? 'has-error' : ''}`}>
                    <label htmlFor="register-name">Ім'я</label>
                    <PersonOutlined className="form-icon" aria-hidden="true" />
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      placeholder="Іван Петренко"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      autoComplete="name"
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
                      required
                    />
                    {fieldErrors.name && (
                      <span className="field-error" id="register-name-error">
                        {fieldErrors.name}
                      </span>
                    )}
                  </div>

                  <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
                    <label htmlFor="register-email">Email</label>
                    <EmailOutlined className="form-icon" aria-hidden="true" />
                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      placeholder="ivanenko@example.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      autoComplete="email"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
                      required
                    />
                    {fieldErrors.email && (
                      <span className="field-error" id="register-email-error">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  <div className={`form-group ${fieldErrors.password ? 'has-error' : ''}`}>
                    <label htmlFor="register-password">Пароль</label>
                    <LockOutlined className="form-icon" aria-hidden="true" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      autoComplete="new-password"
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby="register-password-help"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((isVisible) => !isVisible)}
                      aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                    {fieldErrors.password && (
                      <span className="field-error">{fieldErrors.password}</span>
                    )}
                  </div>

                  <div className={`form-group ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
                    <label htmlFor="register-confirm-password">Підтвердіть пароль</label>
                    <LockOutlined className="form-icon" aria-hidden="true" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      autoComplete="new-password"
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      aria-describedby="register-confirm-password-status"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword((isVisible) => !isVisible)}
                      aria-label={showConfirmPassword ? 'Приховати пароль' : 'Показати пароль'}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                    {passwordsMatch !== null && (
                      <span
                        className={`password-match ${
                          passwordsMatch === true ? 'is-success' : 'is-error'
                        }`}
                        id="register-confirm-password-status"
                        aria-live="polite"
                      >
                        {passwordsMatch === true ? 'Паролі співпадають.' : 'Паролі не співпадають.'}
                      </span>
                    )}
                    {fieldErrors.confirmPassword && (
                      <span className="field-error">{fieldErrors.confirmPassword}</span>
                    )}
                  </div>

                  <button type="submit" className="auth-button btn-primary" disabled={loading}>
                    {loading ? 'Створюємо...' : 'Створити акаунт'}
                  </button>

                  <p className="auth-switch-text">
                    Вже маєте акаунт?
                    <button type="button" onClick={() => switchTab('login')}>
                      Увійти
                    </button>
                  </p>
                </form>
              </div>

              <div
                id="auth-panel-forgot"
                className={`auth-form ${tab === 'forgot' ? 'active' : ''}`}
                hidden={tab !== 'forgot'}
              >
                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotEmailSubmit} noValidate>
                    <div className="form-group">
                      <label htmlFor="forgot-email">Email</label>
                      <EmailOutlined className="form-icon" aria-hidden="true" />
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="ivanenko@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="auth-button btn-primary" disabled={forgotLoading}>
                      {forgotLoading ? 'Надсилання...' : 'Надіслати код'}
                    </button>
                    <p className="auth-switch-text">
                      Згадали пароль?
                      <button type="button" onClick={() => switchTab('login')}>
                        Увійти
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} noValidate>
                    <div className={`form-group ${fieldErrors.forgotCode ? 'has-error' : ''}`}>
                      <label htmlFor="forgot-code">Код підтвердження</label>
                      <LockOutlined className="form-icon" aria-hidden="true" />
                      <input
                        id="forgot-code"
                        type="text"
                        placeholder="1234"
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.forgotCode)}
                        required
                      />
                      <span className="field-hint" style={{ marginTop: '6px', opacity: 0.85 }}>
                        Для демонстрації використовуйте код: <strong>1234</strong>
                      </span>
                      {fieldErrors.forgotCode && (
                        <span className="field-error">{fieldErrors.forgotCode}</span>
                      )}
                    </div>

                    <div className={`form-group ${fieldErrors.forgotPassword ? 'has-error' : ''}`}>
                      <label htmlFor="forgot-password">Новий пароль</label>
                      <LockOutlined className="form-icon" aria-hidden="true" />
                      <input
                        id="forgot-password"
                        type="password"
                        placeholder="••••••••"
                        value={forgotPassword}
                        onChange={(e) => setForgotPassword(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.forgotPassword)}
                        required
                      />
                      {fieldErrors.forgotPassword && (
                        <span className="field-error">{fieldErrors.forgotPassword}</span>
                      )}
                    </div>

                    <div className={`form-group ${fieldErrors.forgotConfirmPassword ? 'has-error' : ''}`}>
                      <label htmlFor="forgot-confirm-password">Підтвердіть новий пароль</label>
                      <LockOutlined className="form-icon" aria-hidden="true" />
                      <input
                        id="forgot-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.forgotConfirmPassword)}
                        required
                      />
                      {forgotPasswordsMatch !== null && (
                        <span
                          className={`password-match ${
                            forgotPasswordsMatch === true ? 'is-success' : 'is-error'
                          }`}
                          aria-live="polite"
                        >
                          {forgotPasswordsMatch === true ? 'Паролі співпадають.' : 'Паролі не співпадають.'}
                        </span>
                      )}
                      {fieldErrors.forgotConfirmPassword && (
                        <span className="field-error">{fieldErrors.forgotConfirmPassword}</span>
                      )}
                    </div>

                    <button type="submit" className="auth-button btn-primary" disabled={forgotLoading}>
                      {forgotLoading ? 'Зміна...' : 'Змінити пароль'}
                    </button>
                    
                    <p className="auth-switch-text">
                      Повернутися назад?
                      <button type="button" onClick={() => setForgotStep(1)}>
                        До введення Email
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
