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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import React, { useState, useEffect, useMemo } from "react";
import { Search, Add, Delete, Close } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import NotificationModal from "../components/NotificationModal";

function UserManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    role: "user",
  });
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: "",
    type: "info",
    title: "",
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/GetallUsers");
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("API Error:", err);
        const errorMessage =
          err.response?.status === 401
            ? "Please log in to view users."
            : err.response?.data?.message || "Failed to load users.";
        setNotificationDialog({
          open: true,
          message: errorMessage,
          type: "error",
          title: "Error",
        });
        if (err.response?.status === 401) {
          dispatch(setAuthError(errorMessage));
          navigate(ROUTES.LOGIN);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, dispatch]);

  const validateForm = () => {
    const errors = {};
    if (!newUser.name.trim()) errors.name = "Name is required";
    if (!newUser.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newUser.email))
      errors.email = "Invalid email format";
    if (!newUser.contact.trim()) errors.contact = "Contact is required";
    else if (!/^\d{10}$/.test(newUser.contact.trim()))
      errors.contact = "Contact must be 10 digits";
    if (!newUser.password.trim()) errors.password = "Password is required";
    else if (newUser.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!newUser.role) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = () => {
    if (!currentUser) {
      setNotificationDialog({
        open: true,
        message: "Please log in to add users.",
        type: "error",
        title: "Authentication Required",
      });
      dispatch(setAuthError("Please log in to add users."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setNewUser({
      name: "",
      email: "",
      contact: "",
      password: "",
      role: "user",
    });
    setFormErrors({});
    setOpenAddModal(true);
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      setLoading(true);
      await api.get(`/remove/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      setNotificationDialog({
        open: true,
        message: "User removed successfully!",
        type: "success",
        title: "Success",
      });
    } catch (err) {
      console.error("API Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to remove user.";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    setFormErrors({ ...formErrors, [name]: null, submit: null });
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      setNotificationDialog({
        open: true,
        message: "Please correct the form errors.",
        type: "error",
        title: "Validation Error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/register", newUser);
      setUsers([...users, response.data.user]);
      setNotificationDialog({
        open: true,
        message: "User registered successfully!",
        type: "success",
        title: "Success",
      });
      setOpenAddModal(false);
      setNewUser({
        name: "",
        email: "",
        contact: "",
        password: "",
        role: "user",
      });
      setFormErrors({});
    } catch (err) {
      console.error("Error adding user:", err);
      const errorMessage = err.response?.data?.message || "Failed to add user.";
      setFormErrors({ submit: errorMessage });
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
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

  const handleNotificationClose = () => {
    setNotificationDialog({ ...notificationDialog, open: false });
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user &&
          ((user.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            (user.email || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      ),
    [users, searchQuery]
  );

  const paginatedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredUsers, page]
  );

  return (
    <Box
      sx={{
        maxWidth: "100%",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 },
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          mb: { xs: 2, sm: 3, md: 4 },
        }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: "bold",
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              textAlign: { xs: "center", sm: "left" },
              mb: { xs: 1, sm: 0 },
            }}
          >
            User Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 2 },
              width: { xs: "100%", sm: "auto" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddUser}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(
                  theme.palette.primary.main
                ),
                "&:hover": { bgcolor: theme.palette.primary.dark },
                borderRadius: 2,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                width: { xs: "100%", sm: "auto" },
                textTransform: "none",
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
                <Search sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
              </IconButton>
              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </Paper>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <motion.div variants={tableVariants} initial="hidden" animate="visible">
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: { xs: 2, sm: 3 },
              }}
            >
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Typography
              sx={{
                color: theme.palette.text.primary,
                textAlign: "center",
                py: { xs: 2, sm: 3 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              No users found.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>
                {paginatedUsers.map((user) => (
                  <Card
                    key={user._id}
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      boxShadow: theme.shadows[2],
                      "&:hover": { boxShadow: theme.shadows[4] },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                      <Typography
                        sx={{ fontSize: "0.875rem", fontWeight: "bold" }}
                      >
                        {user.name || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem" }}>
                        Email: {user.email || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem" }}>
                        Contact: {user.contact || "N/A"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem" }}>
                        Role: {user.role || "N/A"}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        p: 1,
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          textTransform: "none",
                          m: 0.5,
                        }}
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
                          fontSize: "0.75rem",
                          px: 1,
                          textTransform: "none",
                          m: 0.5,
                        }}
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>

              <TableContainer
                component={Paper}
                sx={{
                  display: { xs: "none", sm: "block" },
                  width: "100%",
                  overflowX: "auto",
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  "&:hover": { boxShadow: theme.shadows[8] },
                }}
              >
                <Table
                  sx={{
                    minWidth: 650,
                    "& .MuiTableCell-root": {
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        "& th": {
                          fontWeight: "bold",
                          borderBottom: `2px solid ${theme.palette.secondary.main}`,
                          px: { xs: 1, sm: 2 },
                          py: 1,
                        },
                      }}
                    >
                      <TableCell sx={{ minWidth: 150 }}>Name</TableCell>
                      <TableCell
                        sx={{
                          minWidth: 150,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        Email
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Contact</TableCell>
                      <TableCell
                        sx={{
                          minWidth: 100,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        Role
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          "&:hover": { bgcolor: theme.palette.action.hover },
                          "& td": {
                            px: { xs: 1, sm: 2 },
                            py: 1,
                          },
                        }}
                      >
                        <TableCell>{user.name || "N/A"}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", sm: "table-cell" } }}
                        >
                          {user.email || "N/A"}
                        </TableCell>
                        <TableCell>{user.contact || "N/A"}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          {user.role || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                        >
                          <Tooltip title="Edit functionality coming soon">
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                  px: 1,
                                  textTransform: "none",
                                }}
                              >
                                Edit
                              </Button>
                            </span>
                          </Tooltip>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => handleRemoveUser(user._id)}
                            sx={{
                              fontSize: { xs: "0.7rem", sm: "0.8rem" },
                              px: 1,
                              textTransform: "none",
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
              {filteredUsers.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                    Total Users: {filteredUsers.length}
                  </Typography>
                  <Pagination
                    count={Math.ceil(filteredUsers.length / itemsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </motion.div>
      </Box>

      <Dialog
        open={openAddModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: motion.div,
          variants: modalVariants,
          initial: "hidden",
          animate: "visible",
          sx: {
            minWidth: { xs: 300, sm: 500 },
            borderRadius: 2,
            boxShadow: theme.shadows[10],
            maxHeight: "90vh",
            overflowY: "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "1rem", sm: "1.25rem" },
            position: "relative",
          }}
        >
          Add New User
          <IconButton
            onClick={handleCancel}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              p: { xs: 0.5, sm: 1 },
            }}
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: theme.palette.error.light,
                borderRadius: 1,
                color: theme.palette.error.contrastText,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              {formErrors.submit}
            </Box>
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
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
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
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
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
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
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
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              },
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
              sx={{
                "& .MuiSelect-select": {
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                },
                "& .MuiInputLabel-root": {
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                },
              }}
            >
              <MenuItem
                value="user"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                User
              </MenuItem>
              <MenuItem
                value="admin"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                Admin
              </MenuItem>
              <MenuItem
                value="staff"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                Staff
              </MenuItem>
            </Select>
            {formErrors.role && (
              <FormHelperText sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
                {formErrors.role}
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
            pb: { xs: 1.5, sm: 2 },
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              color: theme.palette.text.primary,
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              "&:hover": { bgcolor: theme.palette.primary.dark },
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              textTransform: "none",
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationModal
        isOpen={notificationDialog.open}
        onClose={handleNotificationClose}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />
    </Box>
  );
}

export default UserManagement;
