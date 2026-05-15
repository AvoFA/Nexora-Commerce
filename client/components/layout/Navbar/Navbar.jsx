import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import GridViewIcon from "@mui/icons-material/GridView";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BalanceIcon from "@mui/icons-material/Balance";
import CloseIcon from "@mui/icons-material/Close";
import LogoutConfirmModal from "../../common/LogoutConfirmModal/LogoutConfirmModal";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../../context/AuthContext";
import { useCompare } from "../../../hooks/useCompare";
import MegaMenu from "./MegaMenu.jsx";
import "./Navbar.scss";

const Navbar = ({ openAuth }) => {
  const { state } = useCart();
  const { compareCount } = useCompare();
  const { isAuthenticated, user, logout } = useAuth();
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const closeMegaMenu = () => {
    setIsMegaMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMegaMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    setIsMenuOpen(false);
    closeMegaMenu();
    toast.success("Ви вийшли з акаунта");
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

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
                  aria-label="Відкрити форму входу"
                >
                  <PersonOutlineIcon />
                </button>
              )}

              <Link
                to="/compare"
                className="action-button compare-link"
                title="Порівняння товарів"
                onClick={closeMegaMenu}
              >
                <BalanceIcon />
                {compareCount > 0 && <span className="cart-count">{compareCount}</span>}
              </Link>
              <Link to="/cart" className="action-button cart-link" onClick={closeMegaMenu}>
                <ShoppingCartIcon />
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
                  <div className="mobile-user-info">
                    <span className="mobile-user-name">
                      Привіт, {user?.name || user?.email}
                    </span>
                  </div>
                  <Link
                    to="/favorites"
                    className="mobile-menu-action"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FavoriteIcon />
                    <span>Мої улюблені</span>
                  </Link>
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
                <button
                  className="mobile-menu-action"
                  onClick={() => {
                    setIsMenuOpen(false);
                    openAuth();
                  }}
                >
                  <PersonOutlineIcon />
                  <span>Вхід / Реєстрація</span>
                </button>
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
