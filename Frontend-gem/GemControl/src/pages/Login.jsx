import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { loginSuccess, setError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const error = useSelector((state) => state.auth.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login with:", { email, password });
      const response = await api.post("/login", { email, password });
      console.log("Login response:", response.data);
      const { token, role } = response.data;
      if (!token) {
        throw new Error("No token in response");
      }

      // Store token
      localStorage.setItem("token", token);

      // Decode token to get userId and role (as a fallback)
      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);

      // Use role from response or decoded token
      const userRole = role || decoded.role;
      if (!userRole) {
        throw new Error("Role not found in response or token");
      }

      // Create user object with minimal required fields
      const user = {
        _id: decoded.userId,
        email,
        role: userRole, // Ensure role is set from response or JWT
      };

      dispatch(loginSuccess({ user, token }));
      console.log("Dispatched loginSuccess with:", { user, token });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? "Endpoint not found. Contact your admin."
          : err.response?.status === 401
          ? "Invalid email or password."
          : err.response?.data?.message || err.message || "Login failed.";
      console.error("Login error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      dispatch(setError(errorMessage));
    }
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
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
    </motion.div>
  );
}

export default Login;