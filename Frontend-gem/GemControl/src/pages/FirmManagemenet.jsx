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
import { Search, Add, Edit, Delete } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";

<<<<<<< HEAD
=======
const mockFirms = [
  {
    _id: "mock1",
    name: "Mock Firm 1",
    location: "City A",
    size: "Medium",
    logo: "https://placehold.co/600x400/png",
  },
  {
    _id: "mock2",
    name: "Mock Firm 2",
    location: "City B",
    size: "Large",
    logo: "https://placehold.co/600x400/png",
  },
];

>>>>>>> feat/sachin
function FirmManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newFirm, setNewFirm] = useState({
    logo: null,
    name: "",
    location: "",
    size: "",
  });
  const [editFirm, setEditFirm] = useState({
    _id: "",
    logo: null,
    name: "",
    location: "",
    size: "",
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
    console.log("FirmManagement - Current User:", currentUser);
    const fetchFirms = async () => {
      try {
        console.log("Fetching firms");
        const response = await api.get("/getAllFirms");
        console.log("GetFirms response:", response.data);
        setFirms(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error("GetFirms error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        if (err.response?.status === 401) {
          setError("Please login to view firms.");
          navigate(ROUTES.LOGIN);
        } else if (err.response?.status === 403) {
          setError("Admin access required to view firms.");
        } else {
          setError(err.response?.data?.message || "Failed to load firms.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFirms();
  }, [navigate]);

  const handleAddFirm = () => {
    console.log("HandleAddFirm - Current User:", currentUser);
    if (!currentUser) {
      setError("Please login to add firms.");
      dispatch(setAuthError("Please login to add firms."));
      navigate(ROUTES.LOGIN);
      return;
    }
    const effectiveRole =
      mockAdmin || currentUser.email === "qwertyuiop12@gmail.com"
        ? "admin"
        : currentUser.role?.toLowerCase();
    if (effectiveRole !== "admin") {
      setError("Only admins can add firms. Contact an admin to gain privileges.");
      return;
    }
    setOpenAddModal(true);
  };

  const handleEditFirm = (firm) => {
    console.log("Editing firm:", firm);
    if (!currentUser) {
      setError("Please login to edit firms.");
      dispatch(setAuthError("Please login to edit firms."));
      navigate(ROUTES.LOGIN);
      return;
    }
    const effectiveRole =
      mockAdmin || currentUser.email === "qwertyuiop12@gmail.com"
        ? "admin"
        : currentUser.role?.toLowerCase();
    if (effectiveRole !== "admin") {
      setError("Only admins can edit firms. Contact an admin to gain privileges.");
      return;
    }
    setEditFirm({
      _id: firm._id,
      logo: null,
      name: firm.name,
      location: firm.location,
      size: firm.size,
    });
    setOpenEditModal(true);
  };

  const handleDeleteFirm = async (firmId) => {
    console.log("Deleting firm:", firmId);
    if (!currentUser) {
      setError("Please login to delete firms.");
      dispatch(setAuthError("Please login to delete firms."));
      navigate(ROUTES.LOGIN);
      return;
    }
    const effectiveRole =
      mockAdmin || currentUser.email === "qwertyuiop12@gmail.com"
        ? "admin"
        : currentUser.role?.toLowerCase();
    if (effectiveRole !== "admin") {
      setError("Only admins can delete firms. Contact an admin to gain privileges.");
      return;
    }
    try {
      await api.get(`/removeFirm/${firmId}`);
      setFirms(firms.filter((firm) => firm._id !== firmId));
      setError(null);
    } catch (err) {
      console.error("DeleteFirm error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to delete firm.");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setNewFirm({
      ...newFirm,
      [name]: files ? files[0] : value,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    setEditFirm({
      ...editFirm,
      [name]: files ? files[0] : value,
    });
  };

  const handleSaveFirm = async () => {
    try {
      console.log("Saving new firm:", newFirm);
      const formData = new FormData();
      if (newFirm.logo) formData.append("logo", newFirm.logo);
      formData.append("name", newFirm.name);
      formData.append("location", newFirm.location);
      formData.append("size", newFirm.size);

      const response = await api.post("/createFirm", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("CreateFirm response:", response.data);
      setFirms([...firms, response.data.firm]);
      setOpenAddModal(false);
      setNewFirm({
        logo: null,
        name: "",
        location: "",
        size: "",
      });
      setError(null);
    } catch (err) {
      console.error("CreateFirm error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 403
          ? "Admin access required to add firms."
          : err.response?.status === 400
          ? "Invalid firm data. Ensure name, location, size, and logo are provided."
          : err.response?.data?.message || "Failed to add firm.";
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleUpdateFirm = async () => {
    try {
      console.log("Updating firm:", editFirm);
      const formData = new FormData();
      if (editFirm.logo) formData.append("logo", editFirm.logo);
      formData.append("name", editFirm.name);
      formData.append("location", editFirm.location);
      formData.append("size", editFirm.size);

      const response = await api.put(`/editFirm/${editFirm._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("UpdateFirm response:", response.data);
      setFirms(firms.map((firm) => (firm._id === editFirm._id ? response.data.firm : firm)));
      setOpenEditModal(false);
      setEditFirm({
        _id: "",
        logo: null,
        name: "",
        size: "",
      });
      setError(null);
    } catch (err) {
      console.error("UpdateFirm error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 403
          ? "Admin access required to update firms."
          : err.response?.status === 400
          ? "Invalid firm data. Ensure name, location, and size are provided."
          : err.response?.data?.message || "Failed to update firm.";
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewFirm({
      logo: null,
      // personally i want to add my user role as admin manually so that i can test firm creating and also give postman sample for getallfirms and create firm
      name: "",
      location: "",
      size: "",
    });
  };

  const handleEditCancel = () => {
    setOpenEditModal(false);
    setEditFirm({
      _id: "",
      logo: null,
      name: "",
      location: "",
      size: "",
    });
  };

  const filteredFirms = firms.filter(
    (firm) =>
      firm &&
      ((firm.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (firm.location || "").toLowerCase().includes(searchQuery.toLowerCase()))
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
          Firm Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddFirm}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
            }}
          >
            Add Firm
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
              placeholder="Search firms..."
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
        ) : filteredFirms.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: 4,
            }}
          >
            No firms found.
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
                    <TableCell>Logo</TableCell>
                    <TableCell>Firm Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFirms.map((firm) => (
                    <TableRow
                      key={firm._id}
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
                        {firm._id || "N/A"}
                      </TableCell>
                      <TableCell>
                        <img
                          src={firm.logo || "https://placehold.co/600x400/png"}
                          alt={`${firm.name || "Firm"} logo`}
                          style={{ width: 50, height: 50, borderRadius: 4 }}
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/50")
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.name || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.location || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.size || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditFirm(firm)}
                          sx={{
                            color: theme.palette.secondary.main,
                            borderColor: theme.palette.secondary.main,
                            mr: 1,
                            "&:hover": {
                              bgcolor: theme.palette.action.hover,
                              borderColor: theme.palette.secondary.dark,
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteFirm(firm._id)}
                          sx={{
                            color: theme.palette.error.main,
                            borderColor: theme.palette.error.main,
                            "&:hover": {
                              bgcolor: theme.palette.action.hover,
                              borderColor: theme.palette.error.dark,
                            },
                          }}
                        >
                          Delete
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
          Add New Firm
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Firm Name"
            type="text"
            fullWidth
            value={newFirm.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            value={newFirm.location}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="size"
            label="Size"
            type="number"
            fullWidth
            value={newFirm.size}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="logo"
            label="Logo"
            type="file"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={handleInputChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveFirm}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
            disabled={
              !newFirm.name ||
              !newFirm.location ||
              !newFirm.size ||
              !newFirm.logo
            }
          >
            Save Firm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditModal} onClose={handleEditCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Edit Firm
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Firm Name"
            type="text"
            fullWidth
            value={editFirm.name}
            onChange={handleEditInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            value={editFirm.location}
            onChange={handleEditInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="size"
            label="Size"
            type="number"
            fullWidth
            value={editFirm.size}
            onChange={handleEditInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="logo"
            label="Logo"
            type="file"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={handleEditInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateFirm}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
            disabled={!editFirm.name || !editFirm.location || !editFirm.size}
          >
            Update Firm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FirmManagement;