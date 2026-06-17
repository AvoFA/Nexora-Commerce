import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, IconButton } from "@mui/material";
import {
  Category,
  Close as X,
  Dashboard as DashboardIcon,
  Inventory as Package,
  Logout,
  Menu as MenuIcon,
  People as PeopleIcon,
  ReceiptLong as OrdersIcon,
  Reviews as ReviewsIcon,
  Store,
  MenuOpen,
  History,
  SupervisorAccount,
} from "@mui/icons-material";
import {
  clearAdminSession,
  getAdminNavigationItems,
  getStoredAdminRole,
  getStoredAdminUser,
} from "../../../config/adminAccess";

const navigationMeta = {
  "/admin/dashboard": {
    name: "Дашборд",
    href: "/admin/dashboard",
    icon: DashboardIcon,
  },
  "/admin/products": { name: "Товари", href: "/admin/products", icon: Package },
  "/admin/categories": {
    name: "Категорії",
    href: "/admin/categories",
    icon: Category,
  },
  "/admin/orders": {
    name: "Замовлення",
    href: "/admin/orders",
    icon: OrdersIcon,
  },
  "/admin/reviews": {
    name: "Відгуки та питання",
    href: "/admin/reviews",
    icon: ReviewsIcon,
  },
  "/admin/customers": {
    name: "Покупці",
    href: "/admin/customers",
    icon: PeopleIcon,
  },
  "/admin/logs": {
    name: "Журнал дій",
    href: "/admin/logs",
    icon: History,
  },
  "/admin/staff": {
    name: "Співробітники",
    href: "/admin/staff",
    icon: SupervisorAccount,
  },
};

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("adminSidebarCollapsed") === "true";
  });
  const location = useLocation();
  const navigate = useNavigate();
  const role = getStoredAdminRole();
  const adminUser = getStoredAdminUser();
  const navigation = getAdminNavigationItems(role)
    .map(({ path }) => navigationMeta[path])
    .filter((item) => item && item.href !== "/admin/logs" && item.href !== "/admin/staff");

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebarCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", newState);
  };

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  const sidebarContent = (
    <>
      <div className="admin-sidebar-logo">
        <div className="logo-wrapper">
          <div className="admin-logo-link">
            <img src="/assets/logo/nexora-symbol.svg" alt="Nexora" className="admin-logo-symbol" />
            <div className="logo-text">
              <h1>Nexora</h1>
              <p>Admin Panel</p>
            </div>
          </div>
        </div>

        <IconButton
          className="admin-sidebar-toggle-btn mobile-hidden"
          onClick={toggleSidebarCollapse}
          sx={{ color: "rgba(255,255,255,0.7)", ml: 1 }}
          title={isCollapsed ? "Розгорнути" : "Згорнути"}
        >
          {isCollapsed ? (
            <MenuIcon sx={{ width: "24px", height: "24px" }} />
          ) : (
            <MenuOpen sx={{ width: "24px", height: "24px" }} />
          )}
        </IconButton>

        <IconButton
          className="admin-mobile-menu-btn"
          onClick={() => setSidebarOpen(false)}
          sx={{ display: { lg: "none" }, color: "white" }}
        >
          <X sx={{ width: "20px", height: "20px" }} />
        </IconButton>
      </div>

      <nav className="admin-sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/admin/dashboard" || item.href === "/admin"}
              className={active ? "active" : ""}
              onClick={() => setSidebarOpen(false)}
              title={isCollapsed ? item.name : ""}
            >
              <div className="nav-icon-wrapper">
                <Icon sx={{ width: "20px", height: "20px" }} />
              </div>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        {role === "admin" && (
          <div className="admin-sidebar-footer-nav">
            <NavLink
              to="/admin/staff"
              className={isActive("/admin/staff") ? "active" : ""}
              onClick={() => setSidebarOpen(false)}
              title={isCollapsed ? "Співробітники" : ""}
            >
              <div className="nav-icon-wrapper">
                <SupervisorAccount sx={{ width: "20px", height: "20px" }} />
              </div>
              <span className="nav-text">Співробітники</span>
            </NavLink>
            <NavLink
              to="/admin/logs"
              className={isActive("/admin/logs") ? "active" : ""}
              onClick={() => setSidebarOpen(false)}
              title={isCollapsed ? "Журнал дій" : ""}
            >
              <div className="nav-icon-wrapper">
                <History sx={{ width: "20px", height: "20px" }} />
              </div>
              <span className="nav-text">Журнал дій</span>
            </NavLink>
          </div>
        )}
        {!isCollapsed && adminUser && (
          <div className="admin-user-profile">
            <div className="avatar-wrapper">
              <div className={`profile-avatar role-avatar-${role}`}>
                {adminUser.username ? adminUser.username.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="status-indicator online" />
            </div>
            <div className="profile-info">
              <span className="profile-name" title={adminUser.username}>
                {adminUser.username}
              </span>
              <span className={`profile-role role-${role}`}>
                {role === "admin" ? "Адміністратор" : "Модератор"}
              </span>
            </div>
          </div>
        )}
        {isCollapsed && adminUser && (
          <div className="admin-user-profile-collapsed" title={`${adminUser.username} (${role === "admin" ? "Адміністратор" : "Модератор"})`}>
            <div className="avatar-wrapper">
              <div className={`profile-avatar role-avatar-${role}`}>
                {adminUser.username ? adminUser.username.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="status-indicator online" />
            </div>
          </div>
        )}
        <button className="admin-logout-btn" onClick={handleLogout} title={isCollapsed ? "Вийти" : ""}>
          <Logout sx={{ width: "20px", height: "20px" }} />
          <span className="logout-text">Вийти</span>
        </button>
      </div>
    </>
  );

  return (
    <div className={`admin-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      {sidebarOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9,
          }}
          onClick={() => setSidebarOpen(false)}
          className="lg-hidden"
        />
      )}

      <Box
        component="aside"
        className={`admin-sidebar ${sidebarOpen ? "is-open" : ""} ${isCollapsed ? "is-collapsed" : ""}`}
      >
        {sidebarContent}
      </Box>

      <div className="admin-content-area">
        <Box component="header" className="admin-header">
          <IconButton
            className="admin-mobile-menu-btn lg-hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon sx={{ width: "24px", height: "24px" }} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
        </Box>

        <Box component="main" sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>      </div>
    </div>
  );
};

export default AdminLayout;
