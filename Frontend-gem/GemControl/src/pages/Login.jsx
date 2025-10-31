import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { loginSuccess, setError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";
import NotificationModal from "../components/NotificationModal";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const authError = useSelector((state) => state.auth.error);

  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: "",
    type: "info",
    title: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { email, password });
      const { token, user: responseUser } = response.data;
      if (!token) {
        throw new Error("No token in response");
      }

      const decoded = jwtDecode(token);

      const userRole = responseUser?.role || decoded.role;
      if (!userRole) {
        throw new Error("Role not found in response or token");
      }

      const user = {
        _id: decoded.userId,
        email,
        role: userRole,
        ...responseUser,
      };

      dispatch(loginSuccess({ user, token }));
      setNotificationDialog({ open: true, message: "Login successful!", type: "success", title: "Success" });
      setTimeout(() => navigate(ROUTES.DASHBOARD), 500);
    } catch (err) {
      let errorMessage = "Login failed. Please try again.";
      let errorTitle = "Login Error";

      // Handle specific backend error messages
      const backendMessage = err.response?.data?.message;

      if (err.response?.status === 401) {
        if (backendMessage?.toLowerCase().includes('password')) {
          errorMessage = "Incorrect password. Please check your password and try again.";
          errorTitle = "Incorrect Password";
        } else if (backendMessage?.toLowerCase().includes('user') || backendMessage?.toLowerCase().includes('email')) {
          errorMessage = "User not found. Please check your email address.";
          errorTitle = "User Not Found";
        } else {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
          errorTitle = "Authentication Failed";
        }
      } else if (err.response?.status === 404) {
        errorMessage = "User not found. Please check your email address.";
        errorTitle = "User Not Found";
      } else if (err.response?.status === 403) {
        errorMessage = "Account access denied. Please contact your administrator.";
        errorTitle = "Access Denied";
      } else if (err.response?.status === 409) {
        errorMessage = "Account already exists with this email.";
        errorTitle = "Account Exists";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later or contact support.";
        errorTitle = "Server Error";
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Network error. Please check your internet connection.";
        errorTitle = "Connection Error";
      }

      dispatch(setError(errorMessage));
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: errorTitle
      });
    }
  };

  const handleNotificationClose = () => {
    setNotificationDialog({ ...notificationDialog, open: false });
    dispatch(setError(null));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 6,
          mb: 4,
          p: 3,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: theme.palette.primary.main,
            mb: 2,
            fontWeight: "medium",
            textAlign: "center",
          }}
        >
          Welcome to the Company
        </Typography>
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            mb: 3,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.text.primary,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                  color: "white",
                },
                transition: "background-color 0.3s ease",
              }}
            >
              Login
            </Button>
          </motion.div>
        </form>
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            textAlign: "center",
            color: theme.palette.text.secondary,
          }}
        >
          Don't have an account?{" "}
          <Link
            to={ROUTES.SIGNUP}
            style={{
              color: theme.palette.secondary.main,
              textDecoration: "none",
              fontWeight: "medium",
            }}
            onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.target.style.textDecoration = "none")}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
      <NotificationModal
        isOpen={notificationDialog.open}
        onClose={handleNotificationClose}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />
    </motion.div>
  );
}

export default Login;
