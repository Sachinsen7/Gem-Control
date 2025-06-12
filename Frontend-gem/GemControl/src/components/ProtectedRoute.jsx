import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../utils/routes";

function ProtectedRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} />;
}

export default ProtectedRoute;
