// client/components/layout/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Box, IconButton } from "@mui/material";
import {
  Inventory as Package, // Используем алиасы как в примере
  Category,
  Logout,
  Menu as MenuIcon,
  Close as X,
  Store, // Иконка логотипа
  Reviews as ReviewsIcon,
  ReceiptLong as OrdersIcon,
} from "@mui/icons-material";

const navigation = [
  { name: "Товари", href: "/admin", icon: Package },
  { name: "Категорії", href: "/admin/categories", icon: Category },
  { name: "Замовлення", href: "/admin/orders", icon: OrdersIcon },
  { name: "Відгуки", href: "/admin/reviews", icon: ReviewsIcon },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Скидання сайдбару при переході
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  const isActive = (path) => {
    // Точний збіг для /admin (Products)
    if (path === "/admin") {
      return location.pathname === "/admin/products";
    }
    // Перевірка префіксу для /admin/categories
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Очищаємо адмін сесію
    localStorage.removeItem("adminToken");
    // Перенаправляємо на головну сторінку
    navigate("/");
  };

  // --- Вміст Сайдбару ---
  const sidebarContent = (
    <>
      {/* --- Логотип --- */}
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

      {/* --- Навігація --- */}
      <nav className="admin-sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              // "end" prop для /admin, чтобы он не был активен на /admin/categories
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

      {/* --- Кнопка Вихід --- */}
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
      {/* Оверлей (для мобільних) */}
      {sidebarOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)", // (backdrop-blur-sm)
            zIndex: 9,
          }}
          onClick={() => setSidebarOpen(false)}
          className="lg-hidden" // Скрываем на десктопе (аналог lg:hidden)
        />
      )}

      {/* --- Сайдбар --- */}
      <Box
        component="aside"
        className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}
      >
        {sidebarContent}
      </Box>

      {/* --- Контент --- */}
      <div className="admin-content-area">
        {/* --- Хедер --- */}
        <Box component="header" className="admin-header">
          <IconButton
            className="admin-mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon sx={{ width: "24px", height: "24px" }} />
          </IconButton>



          {/* Пустой div для выравнивания (как flex-1 в примере) */}
          <Box sx={{ flexGrow: 1 }} />

          {/* (Здесь можно будет добавить иконку пользователя, если нужно) */}
        </Box>

        {/* --- Основний контент --- */}
        <Box component="main" sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </div>
    </div>
  );
};

export default AdminLayout;
