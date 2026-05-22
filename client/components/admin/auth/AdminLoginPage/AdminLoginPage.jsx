// Сторінка входу для адміністратора

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PersonOutline,
  LockOutline,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

import './AdminLoginPage.scss';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        // Зберігаємо токен і переходимо в адмінку
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        setError(data.message || 'Невірний логін або пароль');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Помилка сервера. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        {/* Логотип та заголовок */}
        <div className="login-header">
          <h1>ElectroLux</h1>
          <p>Система управління інтернет-магазином</p>
        </div>

        {/* Форма входу */}
        <div className="login-form-card">
          <div className="form-header">
            <h2>Вхід в панель адміністратора</h2>
            <p>Введіть свої облікові дані для доступу</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Поле логіна */}
            <div className="admin-form-group">
              <label>Ім'я користувача</label>
              <div className="input-container">
                <PersonOutline className="admin-form-icon" />
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Поле пароля */}
            <div className="admin-form-group">
              <label>Пароль</label>
              <div className="input-container">
                <LockOutline className="admin-form-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>

            {/* Повідомлення про помилку */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Кнопка */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          {/* Підказка для розробки (можна прибрати в продакшні) */}
          <div className="login-footer">
            <p>
              Admin: admin / admin123<br />
              Moderator: moderator@electrolux.test / Moderator123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
