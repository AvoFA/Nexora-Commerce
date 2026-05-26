import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import GridViewIcon from "@mui/icons-material/GridView";
import MenuIcon from "@mui/icons-material/Menu";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BalanceIcon from "@mui/icons-material/Balance";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryIcon from "@mui/icons-material/History";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import LogoutConfirmModal from "../../common/LogoutConfirmModal/LogoutConfirmModal";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../../context/AuthContext";
import { useLogoutFlow } from "../../../hooks/useLogoutFlow.js";
import { useCompare } from "../../../hooks/useCompare";
import MegaMenu from "./MegaMenu.jsx";
import WishlistTab from "../../../pages/AccountPage/tabs/WishlistTab.jsx";
import { formatPrice } from "../../../utils/formatPrice.js";
import SearchIcon from "@mui/icons-material/Search";
import SearchBar from "../../product/Search/SearchBar.jsx";
import MobileSearchDrawer from "../../product/Search/MobileSearchDrawer.jsx";
import AccountDropdown from "./components/AccountDropdown.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import MobileProfileDrawer from "./components/MobileProfileDrawer.jsx";
import "./Navbar.scss";

export const accountLinks = [
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

export const UserAvatar = ({ name, className = "" }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  return (
    <div className={`user-initial-avatar ${className}`}>
      {initial}
    </div>
  );
};

const Navbar = ({ openAuth }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { state } = useCart();
  const { compareCount } = useCompare();
  const { isAuthenticated, user, wishlistProductIds } = useAuth();
  const wishlistCount = isAuthenticated && wishlistProductIds ? wishlistProductIds.length : 0;
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [activeMobileDrawer, setActiveMobileDrawer] = useState(null); // 'catalog' | 'wishlist' | 'profile' | null

  useEffect(() => {
    if (activeMobileDrawer) {
      document.documentElement.classList.add("body-lock-scroll");
      document.body.classList.add("body-lock-scroll");
    } else {
      document.documentElement.classList.remove("body-lock-scroll");
      document.body.classList.remove("body-lock-scroll");
    }
    return () => {
      document.documentElement.classList.remove("body-lock-scroll");
      document.body.classList.remove("body-lock-scroll");
    };
  }, [activeMobileDrawer]);

  const closeMegaMenu = () => {
    setIsMegaMenuOpen(false);
  };

  const handleLinkClick = () => {
    closeMegaMenu();
    setIsMenuOpen(false);
    setIsAccountDropdownOpen(false);
    setActiveMobileDrawer(null);
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
      setIsAccountDropdownOpen(false);
      setActiveMobileDrawer(null);
    },
  });

  useEffect(() => {
    const handleOpenCatalogEvent = () => {
      setActiveMobileDrawer('catalog');
    };

    window.addEventListener('openMobileCatalog', handleOpenCatalogEvent);
    return () => window.removeEventListener('openMobileCatalog', handleOpenCatalogEvent);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMegaMenu();
        setIsAccountDropdownOpen(false);
        setActiveMobileDrawer(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setActiveMobileDrawer(null);
    setIsMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [location]);

  return (
    <>
      <header className="navbar">
        <div className="container">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/home" onClick={handleLinkClick}>
              <img src="/assets/logo/nexora-full.svg" alt="Nexora" className="logo-img logo-desktop" />
              <img src="/assets/logo/nexora-symbol.svg" alt="Nexora" className="logo-img logo-mobile" />
            </Link>
          </div>

          <nav className="navbar-nav">
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
          </nav>

          <SearchBar />

          <div
            className="mobile-search-header-trigger"
            onClick={() => setActiveMobileDrawer('search')}
          >
            <span className="mobile-search-header-placeholder">Я шукаю...</span>
            <div className="mobile-search-header-icon-btn">
              <SearchIcon style={{ fontSize: 20 }} />
            </div>
          </div>

          <div className="navbar-actions">
            <button
              className="mobile-search-trigger"
              onClick={() => setActiveMobileDrawer('search')}
              aria-label="Пошук товарів"
            >
              <SearchIcon />
            </button>

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
                  <div
                    className={`account-menu-wrapper ${isAccountDropdownOpen ? 'is-open' : ''}`}
                    onMouseEnter={() => setIsAccountDropdownOpen(true)}
                    onMouseLeave={() => setIsAccountDropdownOpen(false)}
                  >
                    <Link to="/account/orders" className="desktop-user-info" onClick={handleLinkClick} title="Мій кабінет">
                      <UserAvatar name={user?.name} className="desktop-user-avatar-icon" />
                      <span>Кабінет</span>
                    </Link>
                    <AccountDropdown
                      isAccountDropdownOpen={isAccountDropdownOpen}
                      user={user}
                      handleLinkClick={handleLinkClick}
                      handleLogoutClick={handleLogoutClick}
                      setIsAccountDropdownOpen={setIsAccountDropdownOpen}
                    />
                  </div>
                  <Link to="/account/wishlist" className="action-button" onClick={handleLinkClick} title="Мої улюблені">
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
                    <span className="action-button-label">Увійти</span>
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
                onClick={handleLinkClick}
              >
                <BalanceIcon />
                <span className="action-button-label">Порівняння</span>
                {compareCount > 0 && <span className="cart-count">{compareCount}</span>}
              </Link>
              <Link
                to="/cart"
                className={`cart-cta${totalItems > 0 ? " cart-cta-filled" : ""}`}
                onClick={handleLinkClick}
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
      </header>

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
                    <span>Увійти</span>
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

      {/* Mobile Bottom Navigation Bar (Comfy style) */}
      <MobileBottomNav
        activeMobileDrawer={activeMobileDrawer}
        currentPath={currentPath}
        totalItems={totalItems}
        wishlistCount={wishlistCount}
        isAuthenticated={isAuthenticated}
        handleLinkClick={handleLinkClick}
        setActiveMobileDrawer={setActiveMobileDrawer}
        setIsMenuOpen={setIsMenuOpen}
        openAuth={openAuth}
      />

      {/* Hoisted Mobile Drawers to prevent containing block backdrop-filter clipping bug */}
      <div className={`bottom-mobile-menu-tab-card${activeMobileDrawer === 'catalog' ? ' is-open' : ''}`}>
        <div className="drawer-backdrop" onClick={() => setActiveMobileDrawer(null)} />
        <div className="mobile-catalog-drawer-wrapper">
          <MegaMenu mode="mobile-drawer" onClose={() => setActiveMobileDrawer(null)} />
        </div>
      </div>

      <div className={`bottom-mobile-menu-tab-card${activeMobileDrawer === 'wishlist' ? ' is-open' : ''}`}>
        <div className="drawer-backdrop" onClick={() => setActiveMobileDrawer(null)} />
        <div className="mobile-catalog-drawer-wrapper is-wishlist-wrapper">
          <div className="mobile-wishlist-panel">
            <div className="mobile-wishlist-panel__header">
              <h2>Обране</h2>
              <button
                type="button"
                className="mobile-profile-drawer__close"
                onClick={() => setActiveMobileDrawer(null)}
                aria-label="Закрити обране"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mobile-wishlist-panel__body">
              {activeMobileDrawer === 'wishlist' && (
                <WishlistTab variant="mobile-panel" onNavigate={handleLinkClick} />
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileProfileDrawer
        activeMobileDrawer={activeMobileDrawer}
        setActiveMobileDrawer={setActiveMobileDrawer}
        handleLinkClick={handleLinkClick}
        handleLogoutClick={handleLogoutClick}
        user={user}
        wishlistCount={wishlistCount}
        compareCount={compareCount}
      />

      <div className={`bottom-mobile-menu-tab-card${activeMobileDrawer === 'search' ? ' is-open' : ''}`}>
        <div className="drawer-backdrop" onClick={() => setActiveMobileDrawer(null)} />
        <div className="mobile-catalog-drawer-wrapper is-search-wrapper">
          <MobileSearchDrawer onClose={() => setActiveMobileDrawer(null)} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
