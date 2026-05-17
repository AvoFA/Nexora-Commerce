import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GridViewIcon from "@mui/icons-material/GridView";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BalanceIcon from "@mui/icons-material/Balance";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryIcon from "@mui/icons-material/History";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import LogoutConfirmModal from "../../common/LogoutConfirmModal/LogoutConfirmModal";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../../context/AuthContext";
import { useLogoutFlow } from "../../../hooks/useLogoutFlow.js";
import { useCompare } from "../../../hooks/useCompare";
import MegaMenu from "./MegaMenu.jsx";
import { formatPrice } from "../../../utils/formatPrice.js";
import "./Navbar.scss";

const accountLinks = [
  {
    to: "/account/orders",
    label: "Мої замовлення",
    icon: Inventory2OutlinedIcon,
  },
  {
    to: "/account/wishlist",
    label: "Обрані товари",
    icon: FavoriteIcon,
  },
  {
    to: "/account/viewed",
    label: "Переглянуті товари",
    icon: HistoryIcon,
  },
  {
    to: "/account/reviews",
    label: "Мої відгуки",
    icon: RateReviewOutlinedIcon,
  },
  {
    to: "/account/profile",
    label: "Персональні дані",
    icon: PersonOutlineIcon,
  },
];

const Navbar = ({ openAuth }) => {
  const { state } = useCart();
  const { compareCount } = useCompare();
  const { isAuthenticated, user } = useAuth();
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const closeMegaMenu = () => {
    setIsMegaMenuOpen(false);
  };

  const {
    isLogoutModalOpen,
    openLogoutModal: handleLogoutClick,
    closeLogoutModal: handleCancelLogout,
    confirmLogout: handleConfirmLogout,
  } = useLogoutFlow({
    onSuccess: () => {
      setIsMenuOpen(false);
      closeMegaMenu();
    },
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMegaMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/home" onClick={closeMegaMenu}>
              ElectroLux
            </Link>
          </div>

          <nav className="navbar-nav">
            <Link to="/home" className="nav-link" onClick={closeMegaMenu}>
              Головна
            </Link>
            <button
              type="button"
              className={`nav-link-button${isMegaMenuOpen ? " is-active" : ""}`}
              onClick={() => setIsMegaMenuOpen((isOpen) => !isOpen)}
              aria-expanded={isMegaMenuOpen}
              aria-haspopup="dialog"
            >
              {isMegaMenuOpen ? <CloseIcon /> : <GridViewIcon />}
              <span>Каталог</span>
            </button>
            <Link to="/about" className="nav-link" onClick={closeMegaMenu}>
              Про нас
            </Link>
          </nav>

          <div className="navbar-actions">
            <button
              className="action-button hamburger-button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Відкрити меню"
            >
              <MenuIcon />
            </button>

            <div className="desktop-actions desktop-only">
              {isAuthenticated ? (
                <>
                  <div className="account-menu-wrapper">
                    <Link to="/account/orders" className="desktop-user-info" title="Мій кабінет">
                      <AccountCircleIcon className="desktop-user-icon" />
                      <span>Кабінет</span>
                    </Link>
                    <div className="account-dropdown" aria-label="Швидкі переходи кабінету">
                      <div className="account-dropdown-user">
                        <AccountCircleIcon />
                        <div>
                          <strong>{user?.name || "Користувач"}</strong>
                          <span>{user?.email}</span>
                        </div>
                      </div>
                      {accountLinks.map(({ to, label, icon: Icon }) => (
                        <Link key={to} to={to} className="account-dropdown-link">
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      ))}
                      <button
                        type="button"
                        className="account-dropdown-link account-dropdown-logout"
                        onClick={handleLogoutClick}
                      >
                        <ExitToAppIcon />
                        <span>Вийти</span>
                      </button>
                    </div>
                  </div>
                  <Link to="/account/wishlist" className="action-button" title="Мої улюблені">
                    <FavoriteIcon />
                    <span className="action-button-label">Обране</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={openAuth}
                    className="action-button"
                    aria-label="Відкрити форму входу"
                  >
                    <AccountCircleIcon />
                    <span className="action-button-label">Кабінет</span>
                  </button>
                  <button
                    onClick={openAuth}
                    className="action-button"
                    aria-label="Увійдіть, щоб переглянути улюблені"
                    title="Мої улюблені"
                  >
                    <FavoriteIcon />
                    <span className="action-button-label">Обране</span>
                  </button>
                </>
              )}

              <Link
                to="/compare"
                className="action-button compare-link"
                title="Порівняння товарів"
                onClick={closeMegaMenu}
              >
                <BalanceIcon />
                <span className="action-button-label">Порівняння</span>
                {compareCount > 0 && <span className="cart-count">{compareCount}</span>}
              </Link>
              <Link
                to="/cart"
                className={`cart-cta${totalItems > 0 ? " cart-cta-filled" : ""}`}
                onClick={closeMegaMenu}
              >
                <ShoppingCartIcon />
                {totalItems > 0 ? (
                  <span className="cart-cta-text">
                    <small>Сума:</small>
                    <strong>{formatPrice(totalPrice)}</strong>
                  </span>
                ) : (
                  <span>Кошик</span>
                )}
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isMegaMenuOpen && <MegaMenu mode="desktop" onClose={closeMegaMenu} />}

      {isMenuOpen && (
        <div className="mobile-menu-overlay open" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(event) => event.stopPropagation()}>
            <button
              className="mobile-menu-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Закрити меню"
            >
              <CloseIcon />
            </button>
            <nav className="mobile-menu-nav">
              <Link to="/home" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                Головна
              </Link>
              <MegaMenu mode="mobile" onClose={() => setIsMenuOpen(false)} />
              <Link to="/about" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                Про нас
              </Link>
            </nav>
            <div className="mobile-menu-actions">
              <Link
                to="/compare"
                className="mobile-menu-action"
                onClick={() => setIsMenuOpen(false)}
              >
                <BalanceIcon />
                <span>Порівняння</span>
                {compareCount > 0 && <span className="mobile-cart-count">{compareCount}</span>}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account/orders"
                    className="mobile-user-info"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mobile-user-name">
                      Привіт, {user?.name || user?.email}
                    </span>
                  </Link>
                  {accountLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="mobile-menu-action"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <button
                    className="mobile-menu-action logout-btn"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogoutClick();
                    }}
                  >
                    <ExitToAppIcon />
                    <span>Вийти</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="mobile-menu-action"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAuth();
                    }}
                  >
                    <AccountCircleIcon />
                    <span>Вхід / Реєстрація</span>
                  </button>
                  <button
                    className="mobile-menu-action"
                    onClick={() => {
                      setIsMenuOpen(false);
                      openAuth();
                    }}
                  >
                    <FavoriteIcon />
                    <span>Мої улюблені</span>
                  </button>
                </>
              )}
              <Link
                to="/cart"
                className="mobile-menu-action"
                onClick={() => setIsMenuOpen(false)}
              >
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
