import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { setError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";

function Signup() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    role: "user", // Default role, adjust as needed
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const error = useSelector((state) => state.auth.error);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending registration request:", userData); // Debug log
      const response = await api.post("/register", userData); // Updated endpoint
      console.log("Registration response:", response.data); // Debug log
      dispatch(setError(null)); // Clear error on success
      navigate(ROUTES.LOGIN); // Redirect to login after successful registration
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message); // Enhanced error logging
      dispatch(setError(err.response?.data?.message || "Registration failed"));
    }
  };

  // Animation variants
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
    </motion.div>
  );
}

export default Signup;
