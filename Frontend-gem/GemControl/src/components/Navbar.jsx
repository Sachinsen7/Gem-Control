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
import { logout } from "../redux/authSlice"; // Assuming logoutSuccess is the action
import { toggleTheme } from "../redux/themeSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import { useState } from "react";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [openDialog, setOpenDialog] = useState(false); // State for logout confirmation

  const handleLogout = () => {
    setOpenDialog(true); // Open confirmation dialog
  };

  const handleConfirmLogout = async () => {
    try {
      await api.get("/api/admin/logout"); // Call logout API with correct endpoint
      dispatch(logout()); // Dispatch logout action
      navigate(ROUTES.LOGIN); // Navigate to login page
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setOpenDialog(false); // Close dialog regardless of success/failure
    }
  };

  const handleCancelLogout = () => {
    setOpenDialog(false); // Close dialog without logging out
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
              onClick={handleLogout} // Trigger dialog on click
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
