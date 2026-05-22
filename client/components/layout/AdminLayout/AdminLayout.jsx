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
} from "@mui/icons-material";
import {
  clearAdminSession,
  getAdminNavigationItems,
  getStoredAdminRole,
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
};

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const role = getStoredAdminRole();
  const navigation = getAdminNavigationItems(role)
    .map(({ path }) => navigationMeta[path])
    .filter(Boolean);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate("/");
  };

  const sidebarContent = (
    <>
      <div className="admin-sidebar-logo">
        <div className="logo-wrapper">
          <Link to="/home" className="admin-logo-link">
            <img src="/assets/logo/nexora-symbol.svg" alt="Nexora" className="admin-logo-symbol" />
            <div className="logo-text">
              <h1>Nexora</h1>
              <p>Admin Panel</p>
            </div>
          </Link>
        </div>
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
            >
              <div className="nav-icon-wrapper">
                <Icon sx={{ width: "20px", height: "20px" }} />
              </div>
              <span className="font-medium text-base">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <Logout sx={{ width: "20px", height: "20px" }} />
          <span>Вийти</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 9,
          }}
          onClick={() => setSidebarOpen(false)}
          className="lg-hidden"
        />
      )}

      <Box
        component="aside"
        className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}
      >
        {sidebarContent}
      </Box>

      <div className="admin-content-area">
        <Box component="header" className="admin-header">
          <IconButton
            className="admin-mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon sx={{ width: "24px", height: "24px" }} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
        </Box>

        <Box component="main" sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </div>
    </div>
  );
};

export default AdminLayout;
