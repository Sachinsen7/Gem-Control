import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { ExitToApp } from "@mui/icons-material";
import { logout } from "../redux/authSlice";
import { toggleTheme } from "../redux/themeSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    setOpenDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      console.log("Attempting logout"); // Debug
      const response = await api.get("/logout");
      console.log("Logout response:", response.data); // Debug
    } catch (err) {
      console.error("Logout error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      }); // Debug
    } finally {
      console.log("Clearing Redux state"); // Debug
      dispatch(logout());
      navigate(ROUTES.LOGIN);
      setOpenDialog(false);
    }
  };

  const handleCancelLogout = () => {
    setOpenDialog(false);
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
      <Dialog
        open={openDialog}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

export default Navbar;
