// конфігурація маршрутизації додатку

import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "sonner";

// імпорти компонентів
import Navbar from "./components/layout/Navbar/Navbar.jsx";
import AdminLayout from "./components/layout/AdminLayout/AdminLayout.jsx";
import Footer from "./components/layout/Footer/Footer.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop.jsx";

// сторінки сайту
import HomePage from "./pages/HomePage/HomePage.jsx";
import ProductPage from "./pages/ProductPage/ProductPage.jsx";
import CartPage from "./pages/CartPage/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage.jsx";
import AboutPage from "./pages/AboutPage/AboutPage.jsx";
import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import FavoritesPage from "./pages/FavoritesPage/FavoritesPage.jsx";
import ComparePage from "./pages/ComparePage/ComparePage.jsx";

// сторінки адмінки
import ProductListPage from "./pages/admin/ProductListPage/ProductListPage.jsx";
import CategoryListPage from "./pages/admin/CategoryListPage/CategoryListPage.jsx";
import AdminLoginPage from "./components/admin/auth/AdminLoginPage/AdminLoginPage.jsx";

// компоненти захисту
import AdminProtectedRoute from "./components/common/AdminProtectedRoute/AdminProtectedRoute.jsx";

// компонент основного макету сайту
const SiteLayout = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}
    >
      {/* Toast для основного сайту */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(27, 35, 53, 0.9)",
            backdropFilter: "blur(10px)",
            borderColor: "rgba(58, 134, 255, 0.2)",
            color: "#F0F4F8",
            marginTop: "50px"
          },
        }}
      />

      <ScrollToTop />
      <Navbar openAuth={() => setIsAuthOpen(true)} />
      <main className="container" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}>
        <Outlet />
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

// компонент макету адмін-панелі з кастомним Toaster
const AdminLayoutWithToaster = () => {
  return (
    <>
      {/* Toast для адмін-панелі */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "linear-gradient(135deg, rgba(22, 33, 62, 0.95), rgba(17, 24, 48, 0.98))",
            border: "1px solid rgba(58, 134, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            color: "#F0F4F8",
            fontSize: "15px",
            padding: "16px 20px",
            minWidth: "300px",
          },
        }}
      />
      <AdminLayout />
    </>
  );
};

// конфігурація маршрутів
export const router = createBrowserRouter([
  {
    // основний сайт
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },  // "/" переадресація
      { path: "/home", element: <HomePage /> },                    // ← головна "/home"
      { path: "/product/:id", element: <ProductPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/catalog", element: <CatalogPage /> },
      { path: "/catalog/:categoryName", element: <CatalogPage /> },
      { path: "/search", element: <CatalogPage /> },
      { path: "/favorites", element: <FavoritesPage /> },
      { path: "/compare", element: <ComparePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> }, // 404 для всіх інших сторінок
    ],
  },
  {
    // сторінка логіну адміністратора (без захисту)
    path: "/admin/login",
    element: <AdminLoginPage />
  },
  {
    // адмін панель (із захистом)
    path: "/admin",
    element: <AdminProtectedRoute><AdminLayoutWithToaster /></AdminProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/products" replace />,
      },
      { path: "/admin/products", element: <ProductListPage /> },
      { path: "/admin/categories", element: <CategoryListPage /> },
    ],
  },
]);

