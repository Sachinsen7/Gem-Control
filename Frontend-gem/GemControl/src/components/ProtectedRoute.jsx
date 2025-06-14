import { Navigate, Outlet } from "react-router-dom"; // Added Outlet
import { useSelector } from "react-redux";
import { ROUTES } from "../utils/routes";

function ProtectedRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return <Outlet />; // Render the nested Route components
}

export default ProtectedRoute;
