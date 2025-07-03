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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add, Delete } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";

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
  const [formErrors, setFormErrors] = useState({});
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    role: "user",
  });

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
    const fetchUsers = async () => {
      try {
        const response = await api.get("/GetallUsers");
        setUsers(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Please log in to view users.");
          dispatch(setAuthError("Please log in to view users."));
          navigate(ROUTES.LOGIN);
        } else {
          setError(err.response?.data?.message || "Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate, dispatch]);

  const validateForm = () => {
    const errors = {};
    if (!newUser.name.trim()) errors.name = "Name is required";
    if (!newUser.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newUser.email))
      errors.email = "Invalid email format";
    if (!newUser.contact.trim()) errors.contact = "Contact is required";
    if (!newUser.password.trim()) errors.password = "Password is required";
    else if (newUser.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!newUser.role) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = () => {
    if (!currentUser) {
      setError("Please log in to add users.");
      dispatch(setAuthError("Please log in to add users."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setOpenAddModal(true);
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await api.get(`/remove/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove user.");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    setFormErrors({ ...formErrors, [name]: null, submit: null });
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post("/register", newUser);
      setUsers([...users, response.data.user]);
      setOpenAddModal(false);
      setNewUser({
        name: "",
        email: "",
        contact: "",
        password: "",
        role: "user",
      });
      setFormErrors({});
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add user.";
      setFormErrors({ submit: errorMessage });
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
    setFormErrors({});
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
        maxWidth: "100%",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 },
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 4 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 2 },
        }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          User Management
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Add User
          </Button>
          <Paper
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 200, md: 300 },
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconButton sx={{ p: { xs: 0.5, sm: 1 } }}>
              <Search
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                }}
              />
            </IconButton>
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                color: theme.palette.text.primary,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
        </Box>
      </Box>

      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: { xs: 2, sm: 4 },
            }}
          >
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
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
                overflowX: "auto",
              }}
            >
              <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      "& th": {
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        borderBottom: `2px solid ${theme.palette.secondary.main}`,
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        px: { xs: 1, sm: 2 },
                      },
                    }}
                  >
                    <TableCell>Name</TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      Contact
                    </TableCell>
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
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          px: { xs: 1, sm: 2 },
                        },
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {user.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        {user.email}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        {user.contact}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {user.role}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: { xs: 0.5, sm: 1 },
                        }}
                      >
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
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            px: { xs: 0.5, sm: 1 },
                          }}
                          disabled
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Delete fontSize="small" />}
                          onClick={() => handleRemoveUser(user._id)}
                          sx={{
                            borderColor: theme.palette.error.main,
                            "&:hover": {
                              bgcolor: theme.palette.error.light,
                              borderColor: theme.palette.error.dark,
                            },
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            px: { xs: 0.5, sm: 1 },
                          }}
                        >
                          Remove
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
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              Page 1
            </Box>
          </>
        )}
      </motion.div>

      <Dialog
        open={openAddModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          Add New User
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
            <Alert
              severity="error"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              {formErrors.submit}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={newUser.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
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
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
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
            error={!!formErrors.contact}
            helperText={formErrors.contact}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
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
            error={!!formErrors.password}
            helperText={formErrors.password}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            required
          />
          <FormControl
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!formErrors.role}
          >
            <InputLabel sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Role
            </InputLabel>
            <Select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              label="Role"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
            {formErrors.role && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                {formErrors.role}
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              color: theme.palette.text.primary,
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
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
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
