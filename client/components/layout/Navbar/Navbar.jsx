import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BalanceIcon from '@mui/icons-material/Balance';
import CloseIcon from '@mui/icons-material/Close';
import LogoutConfirmModal from '../../common/LogoutConfirmModal/LogoutConfirmModal';
import { useCompare } from '../../../hooks/useCompare';
import './Navbar.scss';

// Головна навігаційна панель
const Navbar = ({ openAuth }) => {
  const { state } = useCart();
  const { compareCount } = useCompare();
  const { isAuthenticated, user, logout } = useAuth();
  // Підраховуємо загальну кількість товарів у шапці
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    setIsMenuOpen(false);
    toast.success('Ви вийшли з акаунта');
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-container">

          <div className="navbar-logo">
            <Link to="/home">ElectroLux</Link>
          </div>

          <nav className="navbar-nav">
            <Link to="/home" className="nav-link">Головна</Link>
            <Link to="/catalog" className="nav-link">Каталог</Link>
            <Link to="/about" className="nav-link">Про нас</Link>
          </nav>

          <div className="navbar-actions">
            <button
              className="action-button hamburger-button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Открыть меню"
            >
              <MenuIcon />
            </button>

            {/* Меню для комп'ютерів (сховане на мобільних) */}
            <div className="desktop-actions desktop-only">
              {isAuthenticated ? (
                <>
                  <div className="desktop-user-info">
                    <PersonOutlineIcon className="desktop-user-icon" />
                    <span className="desktop-user-name">{user?.name || user?.email}</span>
                  </div>
                  <Link to="/favorites" className="action-button" title="Мої улюблені">
                    <FavoriteIcon />
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="action-button logout-button"
                    title="Вийти"
                  >
                    <ExitToAppIcon />
                  </button>
                </>
              ) : (
                <button
                  onClick={openAuth}
                  className="action-button"
                  aria-label="Открыть форму входа"
                >
                  <PersonOutlineIcon />
                </button>
              )}
              {/* Кнопка порівняння — для всіх */}
              <Link to="/compare" className="action-button compare-link" title="Порівняння товарів">
                <BalanceIcon />
                {compareCount > 0 && <span className="cart-count">{compareCount}</span>}
              </Link>
              <Link to="/cart" className="action-button cart-link">
                <ShoppingCartIcon />
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </Link>
            </div>
          </div>

        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu-overlay open" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
              <CloseIcon />
            </button>
            <nav className="mobile-menu-nav">
              <Link to="/home" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                Головна
              </Link>
              <Link to="/catalog" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                Каталог
              </Link>
              <Link to="/about" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                Про нас
              </Link>
            </nav>
            <div className="mobile-menu-actions">
              {/* Кнопка порівняння в мобільному меню — для всіх */}
              <Link to="/compare" className="mobile-menu-action" onClick={() => setIsMenuOpen(false)}>
                <BalanceIcon />
                <span>Порівняння</span>
                {compareCount > 0 && <span className="mobile-cart-count">{compareCount}</span>}
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <span className="mobile-user-name">Привіт, {user?.name || user?.email}</span>
                  </div>
                  <Link to="/favorites" className="mobile-menu-action" onClick={() => setIsMenuOpen(false)}>
                    <FavoriteIcon />
                    <span>Мої улюблені</span>
                  </Link>
                  <button
                    className="mobile-menu-action logout-btn"
                    onClick={() => { setIsMenuOpen(false); handleLogoutClick(); }}
                  >
                    <ExitToAppIcon />
                    <span>Вийти</span>
                  </button>
                </>
              ) : (
                <button className="mobile-menu-action" onClick={() => { setIsMenuOpen(false); openAuth(); }}>
                  <PersonOutlineIcon />
                  <span>Вхід / Реєстрація</span>
                </button>
              )}
              <Link to="/cart" className="mobile-menu-action" onClick={() => setIsMenuOpen(false)}>
                <ShoppingCartIcon />
                <span>Кошик</span>
                {totalItems > 0 && <span className="mobile-cart-count">{totalItems}</span>}
              </Link>
            </div>
          </div>
        </div>
      )}

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </header>
  );
};

export default Navbar;
