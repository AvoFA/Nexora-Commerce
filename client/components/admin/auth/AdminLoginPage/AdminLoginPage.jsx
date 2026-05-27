// Admin login page component

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PersonOutline,
  LockOutline,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { API_BASE_URL } from '../../../../config/api.js';

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
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        // Save admin credentials and redirect to dashboard
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
        <div className="login-header">
          <h1>Nexora</h1>
          <p>Система управління інтернет-магазином</p>
        </div>

        <div className="login-form-card">
          <div className="form-header">
            <h2>Вхід в панель адміністратора</h2>
            <p>Введіть свої облікові дані для доступу</p>
          </div>

          <form onSubmit={handleSubmit}>
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

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          {/* Development credentials */}
          <div className="login-footer">
            <p>
              Admin: admin / admin123<br />
              Moderator: moderator@nexora.test / Moderator123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
