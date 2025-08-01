import { Navigate, Outlet } from "react-router-dom"; // Added Outlet
import { useSelector, useDispatch } from "react-redux";
import { ROUTES } from "../utils/routes";
import { setAuthChecked } from "../redux/authSlice";
import { useEffect } from "react";

function ProtectedRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isAuthChecked = useSelector((state) => state.auth.isAuthChecked);
  const dispatch = useDispatch();

  useEffect(() => {
    if(!isAuthChecked){
      dispatch(setAuthChecked())
    }
  }, [dispatch, isAuthChecked]);

  if(!isAuthChecked){
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return <Outlet />; // Render the nested Route components
}

export default ProtectedRoute;
