import { Link, NavLink, Outlet } from "react-router-dom";
import {
  EditOutlined,
  FavoriteBorder,
  History,
  Inventory2Outlined,
  Logout,
  PersonOutline,
  RateReviewOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLogoutFlow } from "../../hooks/useLogoutFlow.js";
import LogoutConfirmModal from "../../components/common/LogoutConfirmModal/LogoutConfirmModal.jsx";
import "./AccountPage.scss";

const accountNavItems = [
  {
    to: "/account/orders",
    label: "Мої замовлення",
    icon: Inventory2Outlined,
  },
  {
    to: "/account/wishlist",
    label: "Обрані товари",
    icon: FavoriteBorder,
  },
  {
    to: "/account/viewed",
    label: "Переглянуті",
    icon: History,
  },
  {
    to: "/account/reviews",
    label: "Відгуки та питання",
    icon: RateReviewOutlined,
  },
  {
    to: "/account/profile",
    label: "Персональні дані",
    icon: PersonOutline,
  },
];

const getDisplayName = (user) => user?.name || "Користувач";

const getInitial = (user) => {
  const source = user?.name || user?.email || "К";
  return source.trim().charAt(0).toUpperCase();
};

const AccountUserSummary = ({ user, variant = "desktop" }) => {
  const isMobile = variant === "mobile";

  return (
    <div className={isMobile ? "account-mobile-user-card" : "account-user-summary"}>
      <div className={isMobile ? "account-mobile-avatar" : "account-avatar"}>
        {getInitial(user)}
      </div>

      <div className={isMobile ? "account-mobile-user-meta" : "account-user-meta"}>
        <div className={isMobile ? "account-mobile-user-name-row" : "account-user-name-row"}>
          <strong>{getDisplayName(user)}</strong>
          <Link
            to="/account/profile"
            className={isMobile ? "account-mobile-user-edit" : "account-user-edit"}
            aria-label="Редагувати персональні дані"
          >
            <EditOutlined />
          </Link>
        </div>

        {isMobile ? (
          <>
            <span>{user?.email || "-"}</span>
            <span>{user?.phone || "-"}</span>
          </>
        ) : (
          <>
            <small>Номер мобільного</small>
            <span>{user?.phone || "-"}</span>
            <small>E-mail</small>
            <span>{user?.email || "-"}</span>
          </>
        )}
      </div>
    </div>
  );
};

const AccountNavigation = ({ variant = "desktop", onLogout }) => {
  const isMobile = variant === "mobile";
  const navClassName = isMobile ? "account-mobile-nav" : "account-nav";
  const linkClassName = isMobile ? "account-mobile-nav-pill" : "account-nav-link";
  const logoutClassName = isMobile
    ? "account-mobile-nav-pill account-mobile-nav-logout"
    : "account-nav-link account-nav-logout";

  return (
    <nav className={navClassName} aria-label="Розділи кабінету">
      {accountNavItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `${linkClassName}${isActive ? " active" : ""}`
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}

      <button type="button" className={logoutClassName} onClick={onLogout}>
        <Logout />
        <span>Вийти</span>
      </button>
    </nav>
  );
};

const AccountPage = () => {
  const { user } = useAuth();

  const {
    isLogoutModalOpen,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout: handleConfirmLogout,
  } = useLogoutFlow({ redirectPath: "/home" });

  return (
    <>
      <div className="account-page">
        <div className="account-mobile-shell">
          <AccountUserSummary user={user} variant="mobile" />
          <AccountNavigation variant="mobile" onLogout={openLogoutModal} />
        </div>

        <div className="account-shell">
          <aside className="account-sidebar" aria-label="Навігація кабінету">
            <AccountUserSummary user={user} />
            <AccountNavigation onLogout={openLogoutModal} />
          </aside>

          <section className="account-content">
            <Outlet />
          </section>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default AccountPage;
