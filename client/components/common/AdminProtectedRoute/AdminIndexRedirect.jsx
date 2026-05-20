import React from "react";
import { Navigate } from "react-router-dom";
import {
  getDefaultAdminPath,
  getStoredAdminRole,
} from "../../../config/adminAccess";

const AdminIndexRedirect = () => {
  const role = getStoredAdminRole();

  return <Navigate to={getDefaultAdminPath(role)} replace />;
};

export default AdminIndexRedirect;
