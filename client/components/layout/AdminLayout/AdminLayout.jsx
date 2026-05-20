import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, IconButton } from "@mui/material";
import {
  Category,
  Close as X,
  Inventory as Package,
  Logout,
  Menu as MenuIcon,
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
  "/admin/products": { name: "Товари", href: "/admin", icon: Package },
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
    if (path === "/admin") {
      return location.pathname === "/admin/products";
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
          <div className="logo-icon-bg">
            <Store sx={{ width: "24px", height: "24px" }} />
          </div>
          <div className="logo-text">
            <h1>ElectroLux</h1>
            <p>Admin Panel</p>
          </div>
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
              end={item.href === "/admin"}
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
