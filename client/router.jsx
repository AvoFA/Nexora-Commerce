import { createBrowserRouter, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import Navbar from "./components/layout/Navbar/Navbar.jsx";
import AdminLayout from "./components/layout/AdminLayout/AdminLayout.jsx";
import Footer from "./components/layout/Footer/Footer.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop.jsx";
import AddedToCartDrawer from "./components/cart/AddedToCartDrawer/AddedToCartDrawer.jsx";
import AppNotifications from "./components/common/AppNotifications/AppNotifications.jsx";
import { NEXORA_NAVIGATE_EVENT, OPEN_AUTH_MODAL_EVENT } from "./utils/authModalEvents.js";

import HomePage from "./pages/HomePage/HomePage.jsx";
import ProductPage from "./pages/ProductPage/ProductPage.jsx";
import ProductFeedbackPage from "./pages/ProductFeedbackPage/ProductFeedbackPage.jsx";
import CartPage from "./pages/CartPage/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage.jsx";
import AboutPage from "./pages/AboutPage/AboutPage.jsx";
import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import ComparePage from "./pages/ComparePage/ComparePage.jsx";
import AccountPage from "./pages/AccountPage/AccountPage.jsx";
import OrdersTab from "./pages/AccountPage/tabs/OrdersTab.jsx";
import WishlistTab from "./pages/AccountPage/tabs/WishlistTab.jsx";
import ProfileTab from "./pages/AccountPage/tabs/ProfileTab.jsx";
import ReviewsTab from "./pages/AccountPage/tabs/ReviewsTab.jsx";
import RecentlyViewedTab from "./pages/AccountPage/tabs/RecentlyViewedTab.jsx";
import AccountPlaceholderTab from "./pages/AccountPage/tabs/AccountPlaceholderTab.jsx";

import DashboardPage from "./pages/admin/DashboardPage/DashboardPage.jsx";
import ProductListPage from "./pages/admin/ProductListPage/ProductListPage.jsx";
import CategoryListPage from "./pages/admin/CategoryListPage/CategoryListPage.jsx";
import ReviewListPage from "./pages/admin/ReviewListPage/ReviewListPage.jsx";
import OrderListPage from "./pages/admin/OrderListPage/OrderListPage.jsx";
import AdminLoginPage from "./components/admin/auth/AdminLoginPage/AdminLoginPage.jsx";
import CustomersPage from "./pages/admin/CustomersPage/CustomersPage.jsx";
import ActivityLogPage from "./pages/admin/ActivityLogPage/ActivityLogPage.jsx";

import AdminProtectedRoute from "./components/common/AdminProtectedRoute/AdminProtectedRoute.jsx";
import AdminIndexRedirect from "./components/common/AdminProtectedRoute/AdminIndexRedirect.jsx";

const SiteLayout = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuth);

    return () => {
      window.removeEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuth);
    };
  }, []);

  useEffect(() => {
    const handleNavigate = (event) => {
      if (typeof event.detail === "string") {
        navigate(event.detail);
      }
    };

    window.addEventListener(NEXORA_NAVIGATE_EVENT, handleNavigate);

    return () => {
      window.removeEventListener(NEXORA_NAVIGATE_EVENT, handleNavigate);
    };
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}
    >
      <Toaster
        className="nexora-toaster"
        position="top-center"
        expand={false}
        theme="dark"
        closeButton
        offset={{ top: 92 }}
        mobileOffset={{ top: 76, right: 12, left: 12 }}
        toastOptions={{
          classNames: {
            toast: 'sonner-toast-premium',
            title: 'sonner-toast-title',
            description: 'sonner-toast-description',
            icon: 'sonner-toast-icon',
            closeButton: 'sonner-toast-close',
            content: 'sonner-toast-content'
          }
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
      <AddedToCartDrawer />
      <AppNotifications />
    </div>
  );
};

const AdminLayoutWithToaster = () => {
  return (
    <>
      <Toaster
        className="nexora-toaster nexora-toaster--admin"
        position="top-right"
        closeButton
        offset={{ top: 18, right: 18 }}
        mobileOffset={{ top: 12, right: 12, left: 12 }}
        toastOptions={{
          classNames: {
            toast: 'sonner-toast-premium',
            title: 'sonner-toast-title',
            description: 'sonner-toast-description',
            icon: 'sonner-toast-icon',
            closeButton: 'sonner-toast-close',
            content: 'sonner-toast-content'
          }
        }}
      />
      <AdminLayout />
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "/home", element: <HomePage /> },
      { path: "/product/:id", element: <ProductPage /> },
      { path: "/product/:id/feedback", element: <ProductFeedbackPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/catalog", element: <CatalogPage /> },
      { path: "/catalog/:categoryName", element: <CatalogPage /> },
      { path: "/search", element: <CatalogPage /> },
      {
        path: "/account",
        element: <AccountPage />,
        children: [
          { index: true, element: <Navigate to="/account/orders" replace /> },
          {
            path: "orders",
            element: <OrdersTab />,
          },
          { path: "wishlist", element: <WishlistTab /> },
          {
            path: "viewed",
            element: <RecentlyViewedTab />,
          },
          {
            path: "reviews",
            element: <ReviewsTab />,
          },
          {
            path: "profile",
            element: <ProfileTab />,
          },
        ],
      },
      { path: "/compare", element: <ComparePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />
  },
  {
    path: "/admin",
    element: <AdminProtectedRoute><AdminLayoutWithToaster /></AdminProtectedRoute>,
    children: [
      {
        index: true,
        element: <AdminIndexRedirect />,
      },
      { path: "/admin/dashboard", element: <DashboardPage /> },
      { path: "/admin/products", element: <ProductListPage /> },
      { path: "/admin/categories", element: <CategoryListPage /> },
      { path: "/admin/reviews", element: <ReviewListPage /> },
      { path: "/admin/orders", element: <OrderListPage /> },
      { path: "/admin/customers", element: <CustomersPage /> },
      { path: "/admin/logs", element: <ActivityLogPage /> },
    ],
  },
]);
