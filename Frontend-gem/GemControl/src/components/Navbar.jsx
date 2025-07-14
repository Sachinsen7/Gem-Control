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
      await api.get("/logout");
    } catch (err) {
    } finally {
      dispatch(logout());
      navigate(ROUTES.LOGIN);
      setOpenDialog(false);
    }
  };

  const handleCancelLogout = () => {
    setOpenDialog(false);
  };

  return (
    <AppBar position="static" sx={{ mb: { xs: 1, sm: 2 } }}>
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 0.5, sm: 1 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
            whiteSpace: { xs: "nowrap", sm: "normal" },
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Gem Control Dashboard
        </Typography>
        {isAuthenticated && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
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
              <ExitToApp fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Toolbar>
      <Dialog
        open={openDialog}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button
            onClick={handleCancelLogout}
            color="primary"
            fullWidth={true}
            sx={{ m: { xs: 0.5, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="primary"
            autoFocus
            fullWidth={true}
            sx={{ m: { xs: 0.5, sm: 1 } }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

export default Navbar;