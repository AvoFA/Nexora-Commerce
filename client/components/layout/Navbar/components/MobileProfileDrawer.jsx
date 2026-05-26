import React from "react";
import { Link } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BalanceIcon from "@mui/icons-material/Balance";
import HistoryIcon from "@mui/icons-material/History";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import GridViewIcon from "@mui/icons-material/GridView";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { UserAvatar } from "../Navbar.jsx";

const MobileProfileDrawer = ({
  activeMobileDrawer,
  setActiveMobileDrawer,
  handleLinkClick,
  handleLogoutClick,
  user,
  wishlistCount,
  compareCount,
}) => {
  return (
    <div
      className={`bottom-mobile-menu-tab-card${
        activeMobileDrawer === "profile" ? " is-open" : ""
      }`}
    >
      <div
        className="drawer-backdrop"
        onClick={() => setActiveMobileDrawer(null)}
      />
      <div className="mobile-catalog-drawer-wrapper is-profile-wrapper">
        <div className="mobile-profile-drawer">
          <div className="mobile-profile-drawer__header">
            <Link
              to="/home"
              className="mobile-profile-drawer__logo"
              onClick={handleLinkClick}
            >
              <img src="/assets/logo/nexora-full.svg" alt="Nexora" />
            </Link>
            <button
              type="button"
              className="mobile-profile-drawer__close"
              onClick={() => setActiveMobileDrawer(null)}
              aria-label="Закрити меню кабінету"
            >
              <CloseIcon />
            </button>
          </div>

          <Link
            to="/account/profile"
            className="mobile-profile-card"
            onClick={handleLinkClick}
          >
            <UserAvatar
              name={user?.name || user?.email}
              className="mobile-profile-card__avatar"
            />
            <div className="mobile-profile-card__meta">
              <strong>{user?.name || "Користувач"}</strong>
              <span>{user?.email || "Персональний кабінет"}</span>
              <span>{user?.phone || "Телефон не вказано"}</span>
            </div>
            <EditOutlinedIcon />
          </Link>

          <nav
            className="mobile-profile-links"
            aria-label="Мобільне меню кабінету"
          >
            <Link
              to="/account/orders"
              className="mobile-profile-link"
              onClick={handleLinkClick}
            >
              <Inventory2OutlinedIcon />
              <span>Замовлення</span>
            </Link>
            <Link
              to="/account/wishlist"
              className="mobile-profile-link"
              onClick={handleLinkClick}
            >
              <FavoriteIcon />
              <span>Обране</span>
              {wishlistCount > 0 && <em>{wishlistCount}</em>}
            </Link>
            <Link
              to="/compare"
              className="mobile-profile-link"
              onClick={handleLinkClick}
            >
              <BalanceIcon />
              <span>Порівняння</span>
              {compareCount > 0 && <em>{compareCount}</em>}
            </Link>
            <Link
              to="/account/viewed"
              className="mobile-profile-link"
              onClick={handleLinkClick}
            >
              <HistoryIcon />
              <span>Переглянуті</span>
            </Link>
            <Link
              to="/account/profile"
              className="mobile-profile-link"
              onClick={handleLinkClick}
            >
              <PersonOutlineIcon />
              <span>Персональні дані</span>
            </Link>
            <Link
              to="/account/reviews"
              className="mobile-profile-link"
              onClick={handleLinkClick}
            >
              <RateReviewOutlinedIcon />
              <span>Відгуки та питання</span>
            </Link>
            <Link
              to="/about"
              className="mobile-profile-link"
              onClick={handleLinkClick}
            >
              <GridViewIcon />
              <span>Про нас</span>
            </Link>
            <button
              type="button"
              className="mobile-profile-link mobile-profile-link--danger"
              onClick={() => {
                setActiveMobileDrawer(null);
                handleLogoutClick();
              }}
            >
              <ExitToAppIcon />
              <span>Вийти</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileProfileDrawer;
