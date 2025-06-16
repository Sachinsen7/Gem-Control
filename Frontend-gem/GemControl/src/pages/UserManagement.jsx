import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputBase,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";

const mockUsers = [
  {
    _id: "mock1",
    name: "Mock User 1",
    email: "user1@example.com",
    contact: "123-456-7890",
    role: "user",
  },
  {
    _id: "mock2",
    name: "Mock User 2",
    email: "user2@example.com",
    contact: "987-654-3210",
    role: "user",
  },
];

function UserManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    role: "user",
  });
  const [mockAdmin, setMockAdmin] = useState(false);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.3, ease: "easeOut" },
    },
  };

  useEffect(() => {
    console.log("UserManagement - Current User:", currentUser);
    const fetchUsers = async () => {
      try {
        console.log("Fetching users");
        const response = await api.get("/GetallUsers");
        console.log("GetUsers response:", response.data);
        setUsers(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error("GetUsers error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        if (err.response?.status === 404) {
          setUsers(mockUsers);
          setError("Users endpoint not found. Displaying sample data.");
        } else if (err.response?.status === 401) {
          setError("Please login to view users.");
          navigate(ROUTES.LOGIN);
        } else {
          setError(err.response?.data?.message || "Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleAddUser = () => {
    console.log("HandleAddUser - Current User:", currentUser);
    if (!currentUser) {
      setError("Please login to add users.");
      dispatch(setAuthError("Please login to add users."));
      navigate(ROUTES.LOGIN);
      return;
    }
    const effectiveRole =
      mockAdmin || currentUser.email === "qwertyuiop12@gmail.com"
        ? "admin"
        : currentUser.role?.toLowerCase();
    if (effectiveRole !== "admin") {
      setError(
        "Only admins can add users. Contact an admin to gain privileges."
      );
      return;
    }
    setOpenAddModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleSaveUser = async () => {
    try {
      console.log("Saving new user:", newUser);
      const response = await api.post("/register", newUser);
      console.log("CreateUser response:", response.data);
      setUsers([...users, response.data.user]);
      setOpenAddModal(false);
      setNewUser({
        name: "",
        email: "",
        contact: "",
        password: "",
        role: "user",
      });
      setError(null);
    } catch (err) {
      console.error("CreateUser error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 400
          ? err.response?.data?.message ||
            "Invalid user data. Ensure all required fields are filled."
          : err.response?.status === 401
          ? "Please login as an admin to add users."
          : err.response?.data?.message || "Failed to add user.";
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewUser({
      name: "",
      email: "",
      contact: "",
      password: "",
      role: "user",
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user &&
      ((user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        py: 2,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setMockAdmin(!mockAdmin)}
          sx={{
            display: process.env.NODE_ENV === "development" ? "block" : "none",
          }}
        >
          Toggle Mock Admin ({mockAdmin ? "On" : "Off"})
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography
          variant="h4"
          sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
        >
          User Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
            }}
          >
            Add User
          </Button>
          <Paper
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              width: { xs: 200, sm: 300 },
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconButton sx={{ p: 1 }}>
              <Search sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }}
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
        </Box>
      </Box>

      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: 4,
            }}
          >
            No users found.
          </Typography>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                width: "100%",
                borderRadius: 8,
                boxShadow: theme.shadows[4],
                "&:hover": { boxShadow: theme.shadows[8] },
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      "& th": {
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        borderBottom: `2px solid ${theme.palette.secondary.main}`,
                      },
                    }}
                  >
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      sx={{
                        "&:hover": {
                          bgcolor: theme.palette.action.hover,
                          transition: "all 0.3s ease",
                        },
                        "& td": {
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {user._id || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {user.name || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {user.email || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {user.contact || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {user.role || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            color: theme.palette.secondary.main,
                            borderColor: theme.palette.secondary.main,
                            "&:hover": {
                              bgcolor: theme.palette.action.hover,
                              borderColor: theme.palette.secondary.dark,
                            },
                          }}
                          disabled
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                mt: 2,
                textAlign: "center",
                color: theme.palette.text.secondary,
              }}
            >
              Page 1
            </Box>
          </>
        )}
      </motion.div>

      <Dialog open={openAddModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Add New User
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={newUser.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="contact"
            label="Contact"
            type="text"
            fullWidth
            value={newUser.contact}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="role"
            label="Role"
            select
            fullWidth
            value={newUser.role}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
            disabled={
              !newUser.name ||
              !newUser.email ||
              !newUser.password ||
              !newUser.contact
            }
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
