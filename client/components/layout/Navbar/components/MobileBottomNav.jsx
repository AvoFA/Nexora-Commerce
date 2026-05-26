import React from "react";
import { Link } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const MobileBottomNav = ({
  activeMobileDrawer,
  currentPath,
  totalItems,
  wishlistCount,
  isAuthenticated,
  handleLinkClick,
  setActiveMobileDrawer,
  setIsMenuOpen,
  openAuth,
}) => {
  return (
    <div
      className={`bottom-mobile-menu${
        activeMobileDrawer === "search" ||
        currentPath === "/cart" ||
        currentPath === "/checkout"
          ? " is-hidden"
          : ""
      }`}
    >
      <Link
        to="/home"
        className="bottom-mobile-menu-main-tab bottom-mobile-menu__item"
        onClick={handleLinkClick}
      >
        <div
          className={`bottom-mobile-menu-tab-tile${
            !activeMobileDrawer && (currentPath === "/home" || currentPath === "/")
              ? " selected"
              : ""
          }`}
        >
          <div
            className={`bottom-mobile-menu-tab-tile__icon-container bottom-mobile-menu-tab-tile__icon-container--mainTab${
              !activeMobileDrawer && (currentPath === "/home" || currentPath === "/")
                ? " bottom-mobile-menu-tab-tile__icon-container--selected"
                : ""
            }`}
          >
            <div className="bottom-mobile-menu-main-tab__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.8 22H6.2C4.97 22 4.29 22 3.65 21.69C3.09 21.42 2.62 20.97 2.33 20.42C2 19.79 2 19.13 2 17.93V10.98C2 10.38 2 10.01 2.11 9.62C2.21 9.28 2.37 8.95 2.59 8.67C2.84 8.35 3.12 8.14 3.63 7.76L10.42 2.68C10.83 2.37 11.1 2.17 11.49 2.07C11.83 1.98 12.18 1.98 12.51 2.07C12.89 2.17 13.17 2.37 13.58 2.68L20.36 7.75C20.87 8.13 21.15 8.34 21.4 8.66C21.62 8.95 21.79 9.27 21.89 9.61C22 10 22 10.37 22 10.97V17.92C22 19.12 22 19.78 21.66 20.42C21.37 20.97 20.91 21.41 20.34 21.69C19.71 22 19.03 22 17.8 22ZM8 18.16H16C16.55 18.16 17 17.71 17 17.16C17 16.61 16.55 16.16 16 16.16H8C7.45 16.16 7 16.61 7 17.16C7 17.71 7.45 18.16 8 18.16Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>
          <div
            className={`bottom-mobile-menu-tab-tile__name${
              !activeMobileDrawer && (currentPath === "/home" || currentPath === "/")
                ? " bottom-mobile-menu-tab-tile__name--selected"
                : ""
            }`}
          >
            Головна
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="bottom-mobile-menu-catalog-tab bottom-mobile-menu__item"
        onClick={() => {
          setIsMenuOpen(false);
          setActiveMobileDrawer((curr) => (curr === "catalog" ? null : "catalog"));
        }}
      >
        <div
          className={`bottom-mobile-menu-tab-tile${
            activeMobileDrawer === "catalog" || currentPath.startsWith("/catalog")
              ? " selected"
              : ""
          }`}
        >
          <div
            className={`bottom-mobile-menu-tab-tile__icon-container bottom-mobile-menu-tab-tile__icon-container--catalogTab${
              activeMobileDrawer === "catalog" || currentPath.startsWith("/catalog")
                ? " bottom-mobile-menu-tab-tile__icon-container--selected"
                : ""
            }`}
          >
            <div className="bottom-mobile-menu-catalog-tab__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.2227 11.6113C14.2227 8.51247 11.7102 6.00012 8.61133 6C5.5124 6 3 8.5124 3 11.6113C3.00012 14.7102 5.51247 17.2227 8.61133 17.2227C10.1152 17.2226 11.4799 16.6293 12.4873 15.666C12.5129 15.633 12.54 15.6006 12.5703 15.5703C12.6006 15.54 12.6331 15.5129 12.666 15.4873C13.6293 14.4799 14.2226 13.1152 14.2227 11.6113ZM22 13C22.5523 13 23 13.4477 23 14C23 14.5523 22.5523 15 22 15H17.833C17.2809 14.9998 16.833 14.5522 16.833 14C16.833 13.4478 17.2809 13.0002 17.833 13H22ZM22 9C22.5523 9 23 9.44772 23 10C23 10.5523 22.5523 11 22 11H18.667C18.1147 11 17.667 10.5523 17.667 10C17.667 9.44772 18.1147 9 18.667 9H22ZM22 5C22.5523 5 23 5.44772 23 6C23 6.55228 22.5523 7 22 7H17C16.4477 7 16 6.55228 16 6C16 5.44772 16.4477 5 17 5H22ZM16.2227 11.6113C16.2226 13.3522 15.6358 14.955 14.6523 16.2373L16.707 18.293C17.0975 18.6835 17.0976 19.3165 16.707 19.707C16.3165 20.0975 15.6835 20.0976 15.293 19.707L13.2373 17.6523C11.955 18.6358 10.3522 19.2226 8.61133 19.2227C4.4079 19.2227 1.00012 15.8147 1 11.6113C1 7.40783 4.40783 4 8.61133 4C12.8147 4.00012 16.2227 7.4079 16.2227 11.6113Z"
                  fill="currentColor"
                  fillOpacity="0.94"
                ></path>
              </svg>
            </div>
          </div>
          <div
            className={`bottom-mobile-menu-tab-tile__name${
              activeMobileDrawer === "catalog" || currentPath.startsWith("/catalog")
                ? " bottom-mobile-menu-tab-tile__name--selected"
                : ""
            }`}
          >
            Каталог
          </div>
        </div>
      </button>

      <Link
        to="/cart"
        className="bottom-mobile-menu-cart-tab bottom-mobile-menu__item"
        onClick={handleLinkClick}
      >
        <div
          className={`bottom-mobile-menu-tab-tile${
            !activeMobileDrawer && currentPath === "/cart" ? " selected" : ""
          }`}
        >
          <div
            className={`bottom-mobile-menu-tab-tile__icon-container bottom-mobile-menu-tab-tile__icon-container--cartTab${
              totalItems > 0 ? " bottom-mobile-menu-tab-tile__icon-container--with-badge" : ""
            }${
              !activeMobileDrawer && currentPath === "/cart"
                ? " bottom-mobile-menu-tab-tile__icon-container--selected"
                : ""
            }`}
          >
            <div className="bottom-mobile-menu-cart-tab__icon">
              <ShoppingCartIcon />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>
          </div>
          <div
            className={`bottom-mobile-menu-tab-tile__name${
              !activeMobileDrawer && currentPath === "/cart"
                ? " bottom-mobile-menu-tab-tile__name--selected"
                : ""
            }`}
          >
            Кошик
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="mobile-menu-wishlist-tab bottom-mobile-menu__item"
        onClick={(e) => {
          if (!isAuthenticated) {
            e.preventDefault();
            openAuth();
          } else {
            setIsMenuOpen(false);
            setActiveMobileDrawer((curr) => (curr === "wishlist" ? null : "wishlist"));
          }
        }}
      >
        <div
          className={`bottom-mobile-menu-tab-tile${
            activeMobileDrawer === "wishlist" ||
            (!activeMobileDrawer && currentPath === "/account/wishlist")
              ? " selected"
              : ""
          }`}
        >
          <div
            className={`bottom-mobile-menu-tab-tile__icon-container bottom-mobile-menu-tab-tile__icon-container--wishlistTab${
              wishlistCount > 0 ? " bottom-mobile-menu-tab-tile__icon-container--with-badge" : ""
            }${
              activeMobileDrawer === "wishlist" ||
              (!activeMobileDrawer && currentPath === "/account/wishlist")
                ? " bottom-mobile-menu-tab-tile__icon-container--selected"
                : ""
            }`}
          >
            <div className="bottom-mobile-menu-wishlist-tab__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.5019 3.56443C6.19061 1.24611 9.65234 1.67099 11.9921 3.7324C14.3294 1.6696 17.7556 1.27475 20.4746 3.55564C23.445 6.04751 23.7994 10.2923 21.5146 13.2597C20.6424 14.3924 18.9393 16.0941 17.3027 17.6533C15.6471 19.2305 13.9953 20.721 13.1806 21.4492C13.1017 21.5197 12.9998 21.6123 12.9023 21.6865C12.7931 21.7695 12.6353 21.873 12.4247 21.9365C12.1443 22.0209 11.8419 22.0209 11.5615 21.9365C11.3509 21.873 11.1931 21.7695 11.0839 21.6865C10.9864 21.6123 10.8845 21.5197 10.8056 21.4492C9.99091 20.721 8.33916 19.2305 6.68354 17.6533C5.0469 16.0941 3.3438 14.3924 2.47162 13.2597C0.178083 10.281 0.598043 6.06861 3.5019 3.56443ZM11.2304 5.80173C9.52429 3.78874 6.81834 3.34515 4.80756 5.07908C2.70133 6.89542 2.4157 9.90788 4.05658 12.039C4.82001 13.0305 6.40982 14.6307 8.06244 16.2051C9.60283 17.6725 11.1451 19.0664 11.9931 19.8261C12.8411 19.0664 14.3834 17.6725 15.9238 16.2051C17.5764 14.6307 19.1662 13.0305 19.9296 12.039C21.5792 9.89655 21.3141 6.87107 19.1884 5.08787C17.1244 3.35682 14.4542 3.79781 12.7558 5.80173C12.5658 6.02592 12.287 6.15524 11.9931 6.15525C11.6992 6.15525 11.4204 6.02593 11.2304 5.80173Z" fill="currentColor"></path>
              </svg>
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </div>
          </div>
          <div
            className={`bottom-mobile-menu-tab-tile__name${
              activeMobileDrawer === "wishlist" ||
              (!activeMobileDrawer && currentPath === "/account/wishlist")
                ? " bottom-mobile-menu-tab-tile__name--selected"
                : ""
            }`}
          >
            Обране
          </div>
        </div>
      </button>

      {isAuthenticated ? (
        <button
          type="button"
          className="bottom-mobile-menu-main-menu-tab bottom-mobile-menu__item"
          onClick={() => {
            setIsMenuOpen(false);
            setActiveMobileDrawer((curr) => (curr === "profile" ? null : "profile"));
          }}
        >
          <div
            className={`bottom-mobile-menu-tab-tile${
              activeMobileDrawer === "profile" ||
              (currentPath.startsWith("/account") && currentPath !== "/account/wishlist")
                ? " selected"
                : ""
            }`}
          >
            <div
              className={`bottom-mobile-menu-tab-tile__icon-container bottom-mobile-menu-tab-tile__icon-container--mainMenuTab${
                activeMobileDrawer === "profile" ||
                (currentPath.startsWith("/account") && currentPath !== "/account/wishlist")
                  ? " bottom-mobile-menu-tab-tile__icon-container--selected"
                  : ""
              }`}
            >
              <div className="bottom-mobile-menu-main-menu-tab__icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 13.6717 3.165 16.0704 5.01367 17.7188C5.07886 17.0263 5.38299 16.3748 5.87891 15.8789C6.44151 15.3163 7.20435 15 8 15H14C14.7957 15 15.5585 15.3163 16.1211 15.8789C16.617 16.3748 16.9201 17.0263 16.9854 17.7188C18.8343 16.0704 20 13.6719 20 11ZM8 17C7.73478 17 7.48051 17.1054 7.29297 17.293C7.10543 17.4805 7 17.7348 7 18V19.0615C8.20525 19.6607 9.56269 20 11 20C12.4373 20 13.7947 19.6607 15 19.0615V18C15 17.7348 14.8946 17.4805 14.707 17.293C14.5195 17.1054 14.2652 17 14 17H8ZM13 9C13 7.89543 12.1046 7 11 7C9.89543 7 9 7.89543 9 9C9 10.1046 9.89543 11 11 11C12.1046 11 13 10.1046 13 9ZM22 11C22 15.0441 19.8157 18.5751 16.5645 20.4863C16.5254 20.5131 16.4842 20.5365 16.4414 20.5576C14.8363 21.4734 12.9802 22 11 22C9.01947 22 7.16286 21.4737 5.55762 20.5576C5.51489 20.5365 5.47358 20.5131 5.43457 20.4863C2.18372 18.575 0 15.0438 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11ZM15 9C15 11.2091 13.2091 13 11 13C8.79086 13 7 11.2091 7 9C7 6.79086 8.79086 5 11 5C13.2091 5 15 6.79086 15 9Z"
                    fill="currentColor"
                    fillOpacity="0.94"
                  ></path>
                </svg>
              </div>
            </div>
            <div
              className={`bottom-mobile-menu-tab-tile__name${
                activeMobileDrawer === "profile" ||
                (currentPath.startsWith("/account") && currentPath !== "/account/wishlist")
                  ? " bottom-mobile-menu-tab-tile__name--selected"
                  : ""
              }`}
            >
              Кабінет
            </div>
          </div>
        </button>
      ) : (
        <button
          type="button"
          className="bottom-mobile-menu-main-menu-tab bottom-mobile-menu__item"
          onClick={openAuth}
        >
          <div
            className={`bottom-mobile-menu-tab-tile${
              currentPath.startsWith("/account") ? " selected" : ""
            }`}
          >
            <div
              className={`bottom-mobile-menu-tab-tile__icon-container bottom-mobile-menu-tab-tile__icon-container--mainMenuTab${
                currentPath.startsWith("/account")
                  ? " bottom-mobile-menu-tab-tile__icon-container--selected"
                  : ""
              }`}
            >
              <div className="bottom-mobile-menu-main-menu-tab__icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 13.6717 3.165 16.0704 5.01367 17.7188C5.07886 17.0263 5.38299 16.3748 5.87891 15.8789C6.44151 15.3163 7.20435 15 8 15H14C14.7957 15 15.5585 15.3163 16.1211 15.8789C16.617 16.3748 16.9201 17.0263 16.9854 17.7188C18.8343 16.0704 20 13.6719 20 11ZM8 17C7.73478 17 7.48051 17.1054 7.29297 17.293C7.10543 17.4805 7 17.7348 7 18V19.0615C8.20525 19.6607 9.56269 20 11 20C12.4373 20 13.7947 19.6607 15 19.0615V18C15 17.7348 14.8946 17.4805 14.707 17.293C14.5195 17.1054 14.2652 17 14 17H8ZM13 9C13 7.89543 12.1046 7 11 7C9.89543 7 9 7.89543 9 9C9 10.1046 9.89543 11 11 11C12.1046 11 13 10.1046 13 9ZM22 11C22 15.0441 19.8157 18.5751 16.5645 20.4863C16.5254 20.5131 16.4842 20.5365 16.4414 20.5576C14.8363 21.4734 12.9802 22 11 22C9.01947 22 7.16286 21.4737 5.55762 20.5576C5.51489 20.5365 5.47358 20.5131 5.43457 20.4863C2.18372 18.575 0 15.0438 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11ZM15 9C15 11.2091 13.2091 13 11 13C8.79086 13 7 11.2091 7 9C7 6.79086 8.79086 5 11 5C13.2091 5 15 6.79086 15 9Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
            <div
              className={`bottom-mobile-menu-tab-tile__name${
                currentPath.startsWith("/account")
                  ? " bottom-mobile-menu-tab-tile__name--selected"
                  : ""
              }`}
            >
              Увійти
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default MobileBottomNav;
