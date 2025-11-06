import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { setError, loginSuccess } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import { Snackbar, Alert as MuiAlert } from "@mui/material";
import NotificationModal from "../components/NotificationModal";

function Signup() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    role: "user",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const error = useSelector((state) => state.auth.error);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: "",
    type: "info",
    title: "",
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending registration request:", userData);
      const response = await api.post("/register", userData);
      console.log("Registration response:", response.data);
      dispatch(setError(null));
      const { user } = response.data;
      dispatch(loginSuccess(user));
      setOpenSnackbar(true);
      setTimeout(() => navigate(ROUTES.DASHBOARD), 2000);
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);

      let errorMessage = "Registration failed. Please try again.";

      if (err.response?.status === 409 || err.response?.data?.message?.includes('already exists')) {
        errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
      } else if (err.response?.status === 400) {
        if (err.response?.data?.message?.includes('password')) {
          errorMessage = "Password must be at least 6 characters long and contain both letters and numbers.";
        } else if (err.response?.data?.message?.includes('email')) {
          errorMessage = "Please enter a valid email address.";
        } else {
          errorMessage = err.response?.data?.message || "Invalid registration data. Please check your information.";
        }
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later or contact support.";
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      dispatch(setError(errorMessage));
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Registration Error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={userData.name}
            onChange={handleChange}
            required
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
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={userData.email}
            onChange={handleChange}
            required
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
            label="Contact"
            name="contact"
            fullWidth
            margin="normal"
            value={userData.contact}
            onChange={handleChange}
            required
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
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={userData.password}
            onChange={handleChange}
            required
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
            label="Role"
            name="role"
            select
            fullWidth
            margin="normal"
            value={userData.role}
            onChange={handleChange}
            SelectProps={{ native: true }}
            required
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
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </TextField>
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
              Sign Up
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
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            style={{
              color: theme.palette.secondary.main,
              textDecoration: "none",
              fontWeight: "medium",
            }}
            onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.target.style.textDecoration = "none")}
          >
            Login
          </Link>
        </Typography>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Signed up successfully!
        </MuiAlert>
      </Snackbar>

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

export default Signup;
