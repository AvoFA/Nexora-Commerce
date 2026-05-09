// Компонент для захисту адмін маршрутів
// Перевіряє чи увійшов користувач як адміністратор

import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  // Швидка синхронна перевірка токена
  const adminToken = localStorage.getItem('adminToken');

  // Перевіряємо наявність токена (будь-який непорожній рядок вважаємо токеном для простоти)
  const hasAdminAccess = !!adminToken;

  // Якщо немає доступу - перенаправляємо на логін
  if (!hasAdminAccess) {
    console.log('Адмін доступ заблокований. Перенаправлення на логін...');
    return <Navigate to="/admin/login" replace />;
  }

  // Якщо доступ є - показуємо дочірні компоненти (адмін панель)
  return children;
};

export default AdminProtectedRoute;
