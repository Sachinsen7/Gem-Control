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
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add, Delete, Edit } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import { toast } from "react-toastify";

function GirviManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [girvis, setGirvis] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [firms, setFirms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newGirvi, setNewGirvi] = useState({
    logo: null,
    customer: "",
    firm: "",
    materialType: "stock",
    materialgitType: "gold",
    material: "",
    waight: "",
    amount: "",
    interestRate: "",
    date: new Date().toISOString().slice(0, 10),
    paymentRefrence: "",
    notes: "",
    status: "active",
  });
  const [editGirvi, setEditGirvi] = useState(null);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3, ease: "easeOut" } },
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [girviResponse, customerResponse, stockResponse, materialResponse, firmResponse] = await Promise.all([
        api.get("/getAllGirvis"),
        api.get("/getAllCustomers"),
        api.get("/getAllStocks"),
        api.get("/getAllRawMaterials"),
        api.get("/getAllFirms"),
      ]);
      setGirvis(Array.isArray(girviResponse.data) ? girviResponse.data : []);
      setCustomers(Array.isArray(customerResponse.data) ? customerResponse.data : []);
      setStocks(Array.isArray(stockResponse.data) ? stockResponse.data : []);
      setRawMaterials(Array.isArray(materialResponse.data) ? materialResponse.data : []);
      setFirms(Array.isArray(firmResponse.data) ? firmResponse.data : []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.response?.status === 401
        ? "Please log in to view Girvi records."
        : err.response?.data?.message || "Failed to load data.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, navigate]);

  useEffect(() => {
    const handleFilter = async () => {
      try {
        setLoading(true);
        let response;
        if (filterType === "customer" && filterValue) {
          response = await api.get("/getGirviByCustomer", { params: { customerId: filterValue } });
        } else if (filterType === "date" && filterValue) {
          response = await api.get("/getGirviByDate", { params: { date: filterValue } });
        } else if (filterType === "status" && filterValue) {
          response = await api.get("/getGirviByStatus", { params: { status: filterValue } });
        } else {
          response = await api.get("/getAllGirvis");
        }
        setGirvis(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Filter error:", err);
        setError(err.response?.data?.message || "Failed to apply filter.");
      } finally {
        setLoading(false);
      }
    };
    if (filterType !== "all" && filterValue) {
      handleFilter();
    } else {
      fetchData();
    }
  }, [filterType, filterValue]);

  const validateForm = (girvi) => {
    const errors = {};
    if (!girvi.customer) errors.customer = "Customer is required";
    if (!girvi.firm) errors.firm = "Firm is required";
    if (!girvi.materialType) errors.materialType = "Material type is required";
    if (!girvi.materialgitType) errors.materialgitType = "Material is required";
    if (!girvi.material) errors.material = "Material ID is required";
    if (!girvi.waight || isNaN(girvi.waight) || girvi.waight <= 0) errors.waight = "Valid weight is required";
    if (!girvi.amount || isNaN(girvi.amount) || girvi.amount <= 0) errors.amount = "Valid amount is required";
    if (!girvi.interestRate || isNaN(girvi.interestRate) || girvi.interestRate < 0) errors.interestRate = "Valid interest rate is required";
    if (!girvi.date) errors.date = "Date is required";
    if (!girvi.status) errors.status = "Status is required";
    if (!girvi.logo) errors.logo = "Logo is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value, files } = e.target;
    const updateState = (prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      ...(name === "materialType" ? { material: "" } : {}),
    });
    if (isEdit) {
      setEditGirvi(updateState);
    } else {
      setNewGirvi(updateState);
    }
    setFormErrors((prev) => ({ ...prev, [name]: null, submit: null }));
  };

  const handleAddGirvi = () => {
    if (!currentUser) {
      setError("Please log in to add Girvi records.");
      dispatch(setAuthError("Please log in to add Girvi records."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setOpenAddModal(true);
  };

  const handleSaveGirvi = async () => {
    if (!validateForm(newGirvi)) return;

    try {
      const formData = new FormData();
      formData.append("logo", newGirvi.logo);
      formData.append("customer", newGirvi.customer);
      formData.append("firm", newGirvi.firm);
      formData.append("materialType", newGirvi.materialType);
      formData.append("materialgitType", newGirvi.materialgitType);
      formData.append("material", newGirvi.material);
      formData.append("waight", parseFloat(newGirvi.waight));
      formData.append("amount", parseFloat(newGirvi.amount));
      formData.append("interestRate", parseFloat(newGirvi.interestRate));
      formData.append("date", newGirvi.date);
      formData.append("paymentRefrence", newGirvi.paymentRefrence || `GIRVI-${Date.now()}`);
      formData.append("notes", newGirvi.notes);
      formData.append("status", newGirvi.status);

      const response = await api.post("/createGirvi", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGirvis((prev) => [...prev, response.data.girvi]);
      setOpenAddModal(false);
      setNewGirvi({
        logo: null,
        customer: "",
        firm: "",
        materialType: "stock",
        materialgitType: "gold",
        material: "",
        waight: "",
        amount: "",
        interestRate: "",
        date: new Date().toISOString().slice(0, 10),
        paymentRefrence: "",
        notes: "",
        status: "active",
      });
      setFormErrors({});
      toast.success("Girvi created successfully");
    } catch (err) {
      console.error("Create girvi error:", err);
      const errorMessage = err.response?.status === 401
        ? "Please log in to add Girvi records."
        : err.response?.status === 403
        ? "Admin access required to add Girvi records."
        : err.response?.data?.message || "Failed to create Girvi.";
      setFormErrors((prev) => ({ ...prev, submit: errorMessage }));
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleEditGirvi = (girvi) => {
    if (!currentUser) {
      setError("Please log in to edit Girvi records.");
      dispatch(setAuthError("Please log in to edit Girvi records."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setEditGirvi({
      _id: girvi._id,
      logo: null, // Logo editing not supported in this example
      customer: girvi.customer?._id || girvi.customer || "",
      firm: girvi.firm?._id || girvi.firm || "",
      materialType: girvi.materialType || "stock",
      materialgitType: girvi.materialgitType || "gold",
      material: girvi.material?._id || girvi.material || "",
      waight: girvi.waight || "",
      amount: girvi.amount || "",
      interestRate: girvi.interestRate || "",
      date: girvi.date ? new Date(girvi.date).toISOString().slice(0, 10) : "",
      paymentRefrence: girvi.paymentRefrence || "",
      notes: girvi.notes || "",
      status: girvi.status || "active",
    });
    setOpenEditModal(true);
  };

  const handleUpdateGirvi = async () => {
    if (!validateForm(editGirvi)) return;

    try {
      const formData = new FormData();
      if (editGirvi.logo) formData.append("logo", editGirvi.logo);
      formData.append("_id", editGirvi._id);
      formData.append("customer", editGirvi.customer);
      formData.append("firm", editGirvi.firm);
      formData.append("materialType", editGirvi.materialType);
      formData.append("materialgitType", editGirvi.materialgitType);
      formData.append("material", editGirvi.material);
      formData.append("waight", parseFloat(editGirvi.waight));
      formData.append("amount", parseFloat(editGirvi.amount));
      formData.append("interestRate", parseFloat(editGirvi.interestRate));
      formData.append("date", editGirvi.date);
      formData.append("paymentRefrence", editGirvi.paymentRefrence || `GIRVI-${Date.now()}`);
      formData.append("notes", editGirvi.notes);
      formData.append("status", editGirvi.status);

      const response = await api.put("/updateGirvi", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGirvis((prev) =>
        prev.map((g) => (g._id === editGirvi._id ? response.data.girvi : g))
      );
      setOpenEditModal(false);
      setEditGirvi(null);
      setFormErrors({});
      toast.success("Girvi updated successfully");
    } catch (err) {
      console.error("Update girvi error:", err);
      const errorMessage = err.response?.status === 401
        ? "Please log in to update Girvi records."
        : err.response?.status === 403
        ? "Admin access required to update Girvi records."
        : err.response?.data?.message || "Failed to update Girvi.";
      setFormErrors((prev) => ({ ...prev, submit: errorMessage }));
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleDeleteGirvi = async (girviId) => {
    if (!window.confirm("Are you sure you want to delete this Girvi record?")) return;
    try {
      await api.delete(`/deleteGirvi?girviId=${girviId}`);
      setGirvis((prev) => prev.filter((girvi) => girvi._id !== girviId));
      setError(null);
      toast.success("Girvi deleted successfully");
    } catch (err) {
      console.error("Delete girvi error:", err);
      setError(err.response?.data?.message || "Failed to delete Girvi.");
    }
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setOpenEditModal(false);
    setNewGirvi({
      logo: null,
      customer: "",
      firm: "",
      materialType: "stock",
      materialgitType: "gold",
      material: "",
      waight: "",
      amount: "",
      interestRate: "",
      date: new Date().toISOString().slice(0, 10),
      paymentRefrence: "",
      notes: "",
      status: "active",
    });
    setEditGirvi(null);
    setFormErrors({});
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue("");
  };
  const handleFilterValueChange = (e) => setFilterValue(e.target.value);

  const filteredGirvis = girvis.filter(
    (girvi) =>
      (girvi.customer?.name || customers.find((c) => c._id === girvi.customer)?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (girvi.firm?.name || firms.find((f) => f._id === girvi.firm)?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (girvi.paymentRefrence || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", width: "100%", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}>
          Girvi Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddGirvi}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
            }}
          >
            Add Girvi
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
            <IconButton sx={{ padding: 1 }}>
              <Search sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }}
              placeholder="Search Girvi records..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={filterType}
            onChange={handleFilterTypeChange}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Filters</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="status">Status</MenuItem>
          </Select>
          {filterType === "customer" && (
            <Select
              value={filterValue}
              onChange={handleFilterValueChange}
              sx={{ width: 150 }}
            >
              <MenuItem value="">Select Customer</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id}>{customer.name}</MenuItem>
              ))}
            </Select>
          )}
          {filterType === "date" && (
            <TextField
              type="date"
              value={filterValue}
              onChange={handleFilterValueChange}
              sx={{ width: 150 }}
              InputLabelProps={{ shrink: true }}
              label="Select Date"
            />
          )}
          {filterType === "status" && (
            <Select
              value={filterValue}
              onChange={handleFilterValueChange}
              sx={{ width: 150 }}
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="released">Released</MenuItem>
            </Select>
          )}
        </Box>
      </Box>

      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : filteredGirvis.length === 0 ? (
          <Typography sx={{ color: theme.palette.text.primary, textAlign: "center", py: 4 }}>
            No Girvi records found.
          </Typography>
        ) : (
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
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.background.paper, "& th": { color: theme.palette.text.primary, fontWeight: "bold", borderBottom: `2px solid ${theme.palette.secondary.main}` } }}>
                  <TableCell>Logo</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Firm</TableCell>
                  <TableCell>Material Type</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Weight (g)</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell>Interest Rate (%)</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payment Reference</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGirvis.map((girvi) => (
                  <TableRow
                    key={girvi._id}
                    sx={{
                      "&:hover": { bgcolor: theme.palette.action.hover, transition: "all 0.3s ease" },
                      "& td": { borderBottom: `1px solid ${theme.palette.divider}` },
                    }}
                  >
                    <TableCell>
                      {girvi.logo ? (
                        <Box
                          sx={{
                            width: { xs: 40, sm: 50 },
                            height: { xs: 40, sm: 50 },
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={`http://localhost:3002/${girvi.logo}`}
                            alt={`${girvi.paymentRefrence || "Girvi"} logo`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              console.error(`Failed to load logo: ${girvi.logo}`);
                              e.target.src = "/fallback-logo.png";
                            }}
                          />
                        </Box>
                      ) : (
                        "No Logo"
                      )}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {girvi.customer?.name || customers.find((c) => c._id === girvi.customer)?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {girvi.firm?.name || firms.find((f) => f._id === girvi.firm)?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{girvi.materialgitType}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {girvi.materialType === "stock"
                        ? stocks.find((s) => s._id === girvi.material)?.name || "N/A"
                        : rawMaterials.find((m) => m._id === girvi.material)?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{girvi.waight}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>₹{girvi.amount}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{girvi.interestRate}%</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {girvi.date ? new Date(girvi.date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{girvi.paymentRefrence || "N/A"}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{girvi.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditGirvi(girvi)}
                        sx={{
                          color: theme.palette.secondary.main,
                          borderColor: theme.palette.secondary.main,
                          "&:hover": { bgcolor: theme.palette.action.hover, borderColor: theme.palette.secondary.dark },
                          mr: 1,
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteGirvi(girvi._id)}
                        sx={{
                          borderColor: theme.palette.error.main,
                          "&:hover": { bgcolor: theme.palette.error.light, borderColor: theme.palette.error.dark },
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
        )}
        <Box sx={{ mt: 2, textAlign: "center", color: theme.palette.text.secondary }}>
          Page 1
        </Box>
      </motion.div>

      {/* Add Girvi Modal */}
      <Dialog open={openAddModal} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.text.primary }}>
          Add New Girvi
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>{formErrors.submit}</Alert>
          )}
          <Select
            name="customer"
            value={newGirvi.customer}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.customer}
            required
          >
            <MenuItem value="" disabled>Select Customer</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer._id} value={customer._id}>{customer.name}</MenuItem>
            ))}
          </Select>
          <Select
            name="firm"
            value={newGirvi.firm}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.firm}
            required
          >
            <MenuItem value="" disabled>Select Firm</MenuItem>
            {firms.map((firm) => (
              <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
            ))}
          </Select>
          <Select
            name="materialType"
            value={newGirvi.materialType}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.materialType}
            required
          >
            <MenuItem value="stock">Stock</MenuItem>
            <MenuItem value="rawMaterial">Raw Material</MenuItem>
          </Select>
          <Select
            name="materialgitType"
            value={newGirvi.materialgitType}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.materialgitType}
            required
          >
            <MenuItem value="gold">Gold</MenuItem>
            <MenuItem value="silver">Silver</MenuItem>
            <MenuItem value="platinum">Platinum</MenuItem>
            <MenuItem value="diamond">Diamond</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          <Select
            name="material"
            value={newGirvi.material}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.material}
            required
          >
            <MenuItem value="" disabled>
              Select {newGirvi.materialType === "stock" ? "Stock" : "Raw Material"}
            </MenuItem>
            {(newGirvi.materialType === "stock" ? stocks : rawMaterials)
              .filter((item) => item.materialgitType === newGirvi.materialgitType)
              .map((item) => (
                <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
              ))}
          </Select>
          <TextField
            name="waight"
            label="Weight (g)"
            type="number"
            value={newGirvi.waight}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.waight}
            helperText={formErrors.waight}
            required
          />
          <TextField
            name="amount"
            label="Amount (₹)"
            type="number"
            value={newGirvi.amount}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.amount}
            helperText={formErrors.amount}
            required
          />
          <TextField
            name="interestRate"
            label="Interest Rate (%)"
            type="number"
            value={newGirvi.interestRate}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.interestRate}
            helperText={formErrors.interestRate}
            required
          />
          <TextField
            name="date"
            label="Date"
            type="date"
            value={newGirvi.date}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.date}
            helperText={formErrors.date}
            required
          />
          <TextField
            name="paymentRefrence"
            label="Payment Reference"
            type="text"
            value={newGirvi.paymentRefrence}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            name="notes"
            label="Notes"
            multiline
            rows={3}
            value={newGirvi.notes}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Select
            name="status"
            value={newGirvi.status}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.status}
            required
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="released">Released</MenuItem>
          </Select>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              component="label"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.text.primary,
                "&:hover": { bgcolor: theme.palette.secondary.dark },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                width: { xs: "100%", sm: "auto" },
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
              sx={{
                mt: 1,
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
              }}
            >
              {newGirvi.logo ? newGirvi.logo.name : "No file chosen"}
            </Typography>
            {newGirvi.logo && (
              <img
                src={URL.createObjectURL(newGirvi.logo)}
                alt="Logo preview"
                style={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: 4,
                  marginTop: 1,
                  objectFit: "contain",
                }}
                onError={(e) => {
                  console.error("Failed to preview logo");
                  e.target.src = "/fallback-logo.png";
                }}
              />
            )}
            {formErrors.logo && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                {formErrors.logo}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
          <Button onClick={handleCancel} sx={{ color: theme.palette.text.primary, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveGirvi}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Save Girvi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Girvi Modal */}
      <Dialog open={openEditModal} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.text.primary }}>
          Edit Girvi
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>{formErrors.submit}</Alert>
          )}
          {editGirvi && (
            <>
              <Select
                name="customer"
                value={editGirvi.customer}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.customer}
                required
              >
                <MenuItem value="" disabled>Select Customer</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>{customer.name}</MenuItem>
                ))}
              </Select>
              <Select
                name="firm"
                value={editGirvi.firm}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.firm}
                required
              >
                <MenuItem value="" disabled>Select Firm</MenuItem>
                {firms.map((firm) => (
                  <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
                ))}
              </Select>
              <Select
                name="materialType"
                value={editGirvi.materialType}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.materialType}
                required
              >
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="rawMaterial">Raw Material</MenuItem>
              </Select>
              <Select
                name="materialgitType"
                value={editGirvi.materialgitType}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.materialgitType}
                required
              >
                <MenuItem value="gold">Gold</MenuItem>
                <MenuItem value="silver">Silver</MenuItem>
                <MenuItem value="platinum">Platinum</MenuItem>
                <MenuItem value="diamond">Diamond</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              <Select
                name="material"
                value={editGirvi.material}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.material}
                required
              >
                <MenuItem value="" disabled>
                  Select {editGirvi.materialType === "stock" ? "Stock" : "Raw Material"}
                </MenuItem>
                {(editGirvi.materialType === "stock" ? stocks : rawMaterials)
                  .filter((item) => item.materialgitType === editGirvi.materialgitType)
                  .map((item) => (
                    <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
                  ))}
              </Select>
              <TextField
                name="waight"
                label="Weight (g)"
                type="number"
                value={editGirvi.waight}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.waight}
                helperText={formErrors.waight}
                required
              />
              <TextField
                name="amount"
                label="Amount (₹)"
                type="number"
                value={editGirvi.amount}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                required
              />
              <TextField
                name="interestRate"
                label="Interest Rate (%)"
                type="number"
                value={editGirvi.interestRate}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.interestRate}
                helperText={formErrors.interestRate}
                required
              />
              <TextField
                name="date"
                label="Date"
                type="date"
                value={editGirvi.date}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.date}
                helperText={formErrors.date}
                required
              />
              <TextField
                name="paymentRefrence"
                label="Payment Reference"
                type="text"
                value={editGirvi.paymentRefrence}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                name="notes"
                label="Notes"
                multiline
                rows={3}
                value={editGirvi.notes}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Select
                name="status"
                value={editGirvi.status}
                onChange={(e) => handleInputChange(e, true)}
                fullWidth
                sx={{ mb: 2 }}
                error={!!formErrors.status}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="released">Released</MenuItem>
              </Select>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                    "&:hover": { bgcolor: theme.palette.secondary.dark },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Upload New Logo
                  <input
                    type="file"
                    hidden
                    name="logo"
                    onChange={(e) => handleInputChange(e, true)}
                    accept="image/*"
                  />
                </Button>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                  }}
                >
                  {editGirvi.logo ? editGirvi.logo.name : "No new file chosen"}
                </Typography>
                {editGirvi.logo && (
                  <img
                    src={URL.createObjectURL(editGirvi.logo)}
                    alt="Logo preview"
                    style={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      borderRadius: 4,
                      marginTop: 1,
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      console.error("Failed to preview logo");
                      e.target.src = "/fallback-logo.png";
                    }}
                  />
                )}
                {formErrors.logo && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                  >
                    {formErrors.logo}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
          <Button onClick={handleCancel} sx={{ color: theme.palette.text.primary, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateGirvi}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Update Girvi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GirviManagement;