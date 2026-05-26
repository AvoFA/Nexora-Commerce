import React from "react";
import { Link } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { UserAvatar, accountLinks } from "../Navbar.jsx";

const AccountDropdown = ({
  isAccountDropdownOpen,
  user,
  handleLinkClick,
  handleLogoutClick,
  setIsAccountDropdownOpen,
}) => {
  return (
    <div
      className={`account-dropdown ${isAccountDropdownOpen ? "is-visible" : ""}`}
      aria-label="Швидкі переходи кабінету"
    >
      <div className="account-dropdown-user">
        <UserAvatar name={user?.name} className="dropdown-user-avatar" />
        <div>
          <strong>{user?.name || "Користувач"}</strong>
          <span>{user?.email}</span>
        </div>
      </div>
      {accountLinks.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="account-dropdown-link"
          onClick={handleLinkClick}
        >
          <Icon />
          <span>{label}</span>
        </Link>
      ))}
      <button
        type="button"
        className="account-dropdown-link account-dropdown-logout"
        onClick={() => {
          handleLogoutClick();
          setIsAccountDropdownOpen(false);
        }}
      >
        <ExitToAppIcon />
        <span>Вийти</span>
      </button>
    </div>
  );
};

export default AccountDropdown;
