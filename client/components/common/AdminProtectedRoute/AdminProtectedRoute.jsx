import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  clearAdminSession,
  getDefaultAdminPath,
  getStoredAdminRole,
  isAdminPathAllowed,
  isKnownAdminRole,
} from "../../../config/adminAccess";

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  const role = getStoredAdminRole();
  const location = useLocation();

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isKnownAdminRole(role)) {
    clearAdminSession();
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdminPathAllowed(location.pathname, role)) {
    return <Navigate to={getDefaultAdminPath(role)} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
