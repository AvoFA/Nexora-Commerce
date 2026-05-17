import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
    label: "Мої відгуки",
    icon: RateReviewOutlined,
  },
  {
    to: "/account/profile",
    label: "Персональні дані",
    icon: PersonOutline,
  },
];

const getInitial = (user) => {
  const source = user?.name || user?.email || "К";
  return source.trim().charAt(0).toUpperCase();
};

const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    toast.success("Ви вийшли з акаунта");
    navigate("/home");
  };

  return (
    <>
      <div className="account-page">
        <div className="account-shell">
          <aside className="account-sidebar" aria-label="Навігація кабінету">
            <div className="account-user-summary">
              <div className="account-avatar">{getInitial(user)}</div>
              <div className="account-user-meta">
                <div className="account-user-name-row">
                  <strong>{user?.name || "Користувач"}</strong>
                  <Link to="/account/profile" className="account-user-edit" aria-label="Редагувати персональні дані">
                    <EditOutlined />
                  </Link>
                </div>
                <small>Номер мобільного</small>
                <span>{user?.phone || "-"}</span>
                <small>E-mail</small>
                <span>{user?.email || "-"}</span>
              </div>
            </div>

            <nav className="account-nav" aria-label="Розділи кабінету">
              {accountNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `account-nav-link${isActive ? " active" : ""}`
                  }
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}

              <button
                type="button"
                className="account-nav-link account-nav-logout"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <Logout />
                <span>Вийти</span>
              </button>
            </nav>
          </aside>

          <section className="account-content">
            <Outlet />
          </section>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default AccountPage;
