import { useDispatch, useSelector } from "react-redux";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Box,
} from "@mui/material";
import { ExitToApp } from "@mui/icons-material";
import { logoutSuccess } from "../redux/authSlice";
import { toggleTheme } from "../redux/themeSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogout = async () => {
    try {
      await api.get("/logout"); // Call logout API
      dispatch(logoutSuccess());
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
          Gem Control Dashboard
        </Typography>
        {isAuthenticated && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Switch
              checked={darkMode}
              onChange={() => dispatch(toggleTheme())}
              sx={{ mr: { xs: 0, sm: 1 } }}
            />
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <ExitToApp />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
