import { useDispatch, useSelector } from "react-redux";
import { AppBar, Toolbar, Typography, IconButton, Switch } from "@mui/material";
import { ExitToApp } from "@mui/icons-material";
import { logout } from "../redux/authSlice";
import { toggleTheme } from "../redux/themeSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/routes";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gem Control Dashboard
        </Typography>
        <Switch checked={darkMode} onChange={() => dispatch(toggleTheme())} />
        <IconButton color="inherit" onClick={handleLogout}>
          <ExitToApp />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
