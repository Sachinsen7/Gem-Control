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
import { useState, useEffect, useCallback } from "react";
import { Search, Add, Delete } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";

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
  const [formErrors, setFormErrors] = useState({});
  const [newFirm, setNewFirm] = useState({
    logo: null,
    name: "",
    location: "",
    size: "",
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

  const fetchFirms = async () => {
    try {
      const response = await api.get("/getAllFirms");
      setFirms(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("GetFirms error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      if (err.response?.status === 401) {
        setError("Please log in to view firms.");
        dispatch(setAuthError("Please log in to view firms."));
        navigate(ROUTES.LOGIN);
      } else {
        setError(err.response?.data?.message || "Failed to load firms.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFirms();
  }, [navigate, dispatch]);

  const validateForm = (firm) => {
    const errors = {};
    if (!firm.name.trim()) errors.name = "Name is required";
    if (!firm.location.trim()) errors.location = "Location is required";
    if (!firm.size.trim()) errors.size = "Size is required";
    if (!firm.logo) errors.logo = "Logo is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddFirm = () => {
    if (!currentUser) {
      setError("Please log in to add firms.");
      dispatch(setAuthError("Please log in to add firms."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setOpenAddModal(true);
  };

  const handleDeleteFirm = async (firmId) => {
    if (!window.confirm("Are you sure you want to delete this firm?")) return;
    try {
      await api.get(`/removeFirm?firmId=${firmId}`);
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

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setNewFirm({
      ...newFirm,
      [name]: files ? files[0] : value,
    });
    setFormErrors({ ...formErrors, [name]: null, submit: null });
  };

  const handleSaveFirm = useCallback(async () => {
    if (!validateForm(newFirm)) return;

    try {
      const formData = new FormData();
      formData.append("logo", newFirm.logo);
      formData.append("name", newFirm.name);
      formData.append("location", newFirm.location);
      formData.append("size", newFirm.size);

      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      const response = await api.post("/createFirm", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchFirms(); // Refresh firms after adding
      setOpenAddModal(false);
      setNewFirm({ logo: null, name: "", location: "", size: "" });
      setFormErrors({});
      setError(null);
    } catch (err) {
      console.error("CreateFirm error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setFormErrors({
        submit: err.response?.data?.message || "Failed to add firm.",
      });
      dispatch(
        setAuthError(err.response?.data?.message || "Failed to add firm.")
      );
    }
  }, [validateForm, fetchFirms, dispatch]);

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewFirm({ logo: null, name: "", location: "", size: "" });
    setFormErrors({});
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
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
                      <TableCell>
                        {firm.logo ? (
                          <img
                            src={`http://localhost:3002/${firm.logo}`}
                            alt={`${firm.name || "Firm"} logo`}
                            style={{ width: 50, height: 50, borderRadius: 4 }}
                            onError={(e) => {
                              console.error(
                                `Failed to load logo: ${firm.logo}`,
                                `Attempted URL: http://localhost:3002/${firm.logo}`
                              );
                              e.target.src = "/fallback-logo.png";
                            }}
                          />
                        ) : (
                          "No Logo"
                        )}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.name}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.location}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.size}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteFirm(firm._id)}
                          sx={{
                            borderColor: theme.palette.error.main,
                            "&:hover": {
                              bgcolor: theme.palette.error.light,
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
        <DialogContent sx={{ pt: 2 }}>
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Firm Name"
            type="text"
            fullWidth
            value={newFirm.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
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
            error={!!formErrors.location}
            helperText={formErrors.location}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="size"
            label="Size"
            type="text"
            fullWidth
            value={newFirm.size}
            onChange={handleInputChange}
            error={!!formErrors.size}
            helperText={formErrors.size}
            sx={{ mb: 2 }}
            required
          />
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              component="label"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.text.primary,
                "&:hover": { bgcolor: theme.palette.secondary.dark },
              }}
            >
              Upload Logo
              <input
                type="file"
                hidden
                name="logo"
                onChange={handleInputChange}
                accept="image/*"
              />
            </Button>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: theme.palette.text.secondary }}
            >
              {newFirm.logo ? newFirm.logo.name : "No file chosen"}
            </Typography>
            {newFirm.logo && (
              <img
                src={URL.createObjectURL(newFirm.logo)}
                alt="Logo preview"
                style={{ width: 100, height: 100, borderRadius: 4, mt: 1 }}
                onError={(e) => {
                  console.error("Failed to preview logo");
                  e.target.src = "/fallback-logo.png";
                }}
              />
            )}
            {formErrors.logo && (
              <Typography color="error" variant="caption">
                {formErrors.logo}
              </Typography>
            )}
          </Box>
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
          >
            Save Firm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FirmManagement;
