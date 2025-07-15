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
  const [firms, setFirms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [newGirvi, setNewGirvi] = useState({
    girviItemImg: null,
    itemName: "",
    itemType: "gold",
    itemWeight: "",
    itemValue: "",
    itemDescription: "",
    interestRate: "",
    Customer: "",
    firm: "",
    lastDateToTake: new Date().toISOString().slice(0, 10),
  });
  const [editGirvi, setEditGirvi] = useState(null);

  // Animation variants
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [girviResponse, customerResponse, firmResponse] = await Promise.all(
        [
          api.get("/getAllGirviItems"),
          api.get("/getAllCustomers"),
          api.get("/getAllFirms"),
        ]
      );
      console.log("Current User ID:", currentUser?._id);
      console.log("Girvi Response:", girviResponse.data);
      console.log("Customers Response:", customerResponse.data);
      console.log("Firms Response:", firmResponse.data);
      const customersData = Array.isArray(customerResponse.data)
        ? customerResponse.data
        : [];
      const firmsData = Array.isArray(firmResponse.data)
        ? firmResponse.data
        : [];
      setGirvis(Array.isArray(girviResponse.data) ? girviResponse.data : []);
      setCustomers(customersData);
      setFirms(firmsData);
      if (!customersData.length) {
        toast.error(
          "No customers available. Please add customers in Customer Management."
        );
        setError("No customers available. Please add customers first.");
      }
      if (!firmsData.length) {
        toast.error("No firms available. Please add firms in Firm Management.");
        setError("No firms available. Please add firms first.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to load data. Check your network or login status.";
      setError(errorMessage);
      toast.error(errorMessage);
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
          response = await api.get("/getAllGirviItems", {
            params: { customerId: filterValue },
          });
        } else if (filterType === "date" && filterValue) {
          response = await api.get("/getAllGirviItems", {
            params: { date: filterValue },
          });
        } else {
          response = await api.get("/getAllGirviItems");
        }
        console.log("Filter Response:", response.data);
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

  const validateForm = (girvi, isEdit = false) => {
    const errors = {};
    if (!girvi.itemName) errors.itemName = "Item name is required";
    if (!girvi.itemType) errors.itemType = "Item type is required";
    if (
      !girvi.itemWeight ||
      isNaN(girvi.itemWeight) ||
      parseFloat(girvi.itemWeight) <= 0
    )
      errors.itemWeight = "Valid weight is required";
    if (
      !girvi.itemValue ||
      isNaN(girvi.itemValue) ||
      parseFloat(girvi.itemValue) <= 0
    )
      errors.itemValue = "Valid amount is required";
    if (!girvi.itemDescription)
      errors.itemDescription = "Description is required";
    if (
      !girvi.interestRate ||
      isNaN(girvi.interestRate) ||
      parseFloat(girvi.interestRate) < 0
    )
      errors.interestRate = "Valid interest rate is required";
    if (!girvi.Customer) errors.Customer = "Customer is required";
    if (!girvi.firm) errors.firm = "Firm is required";
    if (!girvi.lastDateToTake)
      errors.lastDateToTake = "Last date to take is required";
    if (!isEdit && !girvi.girviItemImg)
      errors.girviItemImg = "Item image is recommended";
    setFormErrors(errors);
    return (
      Object.keys(errors).filter((key) => key !== "girviItemImg").length === 0
    );
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value, files } = e.target;
    console.log(`Input Change - Name: ${name}, Value: ${value}, Files:`, files);
    const updateState = (prev) => {
      const updated = { ...prev, [name]: files ? files[0] : value };
      if (
        name === "Customer" &&
        value &&
        !customers.find((c) => c._id === value)
      ) {
        console.warn(`Invalid Customer ID: ${value}`);
        toast.error("Please select a valid customer.");
        return { ...prev, Customer: "" };
      }
      if (name === "firm" && value && !firms.find((f) => f._id === value)) {
        console.warn(`Invalid Firm ID: ${value}`);
        toast.error("Please select a valid firm.");
        return { ...prev, firm: "" };
      }
      return updated;
    };
    if (isEdit) {
      setEditGirvi((prev) => {
        const updated = updateState(prev);
        console.log("Updated editGirvi:", updated);
        validateForm(updated, true); // Validate immediately
        return updated;
      });
    } else {
      setNewGirvi((prev) => {
        const updated = updateState(prev);
        console.log("Updated newGirvi:", updated);
        validateForm(updated, false); // Validate immediately
        return updated;
      });
    }
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFieldBlur = (name) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    validateForm(openEditModal ? editGirvi : newGirvi, openEditModal);
  };

  const handleSaveGirvi = async () => {
    setSaveAttempted(true);
    console.log("newGirvi before validation:", newGirvi);
    if (!validateForm(newGirvi)) {
      console.log("Validation failed with errors:", formErrors);
      return;
    }

    try {
      const formData = new FormData();
      if (newGirvi.girviItemImg)
        formData.append("girviItemImg", newGirvi.girviItemImg);
      formData.append("itemName", newGirvi.itemName);
      formData.append("itemType", newGirvi.itemType);
      formData.append("itemWeight", parseFloat(newGirvi.itemWeight));
      formData.append("itemValue", parseFloat(newGirvi.itemValue));
      formData.append("itemDescription", newGirvi.itemDescription);
      formData.append("interestRate", parseFloat(newGirvi.interestRate));
      formData.append("Customer", newGirvi.Customer);
      formData.append("firm", newGirvi.firm);
      formData.append("lastDateToTake", newGirvi.lastDateToTake);

      console.log("Sending FormData:", Object.fromEntries(formData));
      const response = await api.post("/AddGirviItem", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Add Girvi Response:", response.data);
      setGirvis((prev) => [...prev, response.data.gierviItem]);
      setOpenAddModal(false);
      setNewGirvi({
        girviItemImg: null,
        itemName: "",
        itemType: "gold",
        itemWeight: "",
        itemValue: "",
        itemDescription: "",
        interestRate: "",
        Customer: "",
        firm: "",
        lastDateToTake: new Date().toISOString().slice(0, 10),
      });
      setFormErrors({});
      setTouchedFields({});
      setSaveAttempted(false);
      toast.success("Girvi created successfully");
    } catch (err) {
      console.error("Create girvi error:", err);
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to add Girvi records."
          : err.response?.status === 403
          ? "Admin access required to add Girvi records."
          : err.response?.data?.message || "Failed to create Girvi.";
      console.log("Backend error details:", err.response?.data);
      setFormErrors((prev) => ({ ...prev, submit: errorMessage }));
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
    }
  };

  const handleAddGirvi = () => {
    if (!currentUser) {
      toast.error("Please log in to add Girvi records.");
      dispatch(setAuthError("Please log in to add Girvi records."));
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!customers.length || !firms.length) {
      toast.error("No customers or firms available. Please add them first.");
      return;
    }
    setOpenAddModal(true);
  };

  const handleEditGirvi = (girvi) => {
    if (!currentUser) {
      toast.error("Please log in to edit Girvi records.");
      dispatch(setAuthError("Please log in to edit Girvi records."));
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!customers.length || !firms.length) {
      toast.error(
        "No customers or firms available. Please add customers and firms first."
      );
      return;
    }
    console.log("Editing Girvi:", girvi);
    setEditGirvi({
      _id: girvi._id,
      girviItemImg: null,
      itemName: girvi.itemName || "",
      itemType: girvi.itemType || "gold",
      itemWeight: girvi.itemWeight || "",
      itemValue: girvi.itemValue || "",
      itemDescription: girvi.itemDescription || "",
      interestRate: girvi.interestRate || "",
      Customer: girvi.Customer?._id || girvi.Customer || "",
      firm: girvi.firm?._id || girvi.firm || "",
      lastDateToTake: girvi.lastDateToTake
        ? new Date(girvi.lastDateToTake).toISOString().slice(0, 10)
        : "",
    });
    setOpenEditModal(true);
  };

  const handleUpdateGirvi = async () => {
    setSaveAttempted(true);
    console.log("editGirvi before validation:", editGirvi);
    if (!validateForm(editGirvi, true)) {
      console.log("Validation failed with errors:", formErrors);
      return;
    }

    try {
      const formData = new FormData();
      if (editGirvi.girviItemImg)
        formData.append("girviItemImg", editGirvi.girviItemImg);
      formData.append("_id", editGirvi._id);
      formData.append("itemName", editGirvi.itemName);
      formData.append("itemType", editGirvi.itemType);
      formData.append("itemWeight", parseFloat(editGirvi.itemWeight));
      formData.append("itemValue", parseFloat(editGirvi.itemValue));
      formData.append("itemDescription", editGirvi.itemDescription);
      formData.append("interestRate", parseFloat(editGirvi.interestRate));
      formData.append("Customer", editGirvi.Customer);
      formData.append("firm", editGirvi.firm);
      formData.append("lastDateToTake", editGirvi.lastDateToTake);

      console.log("Sending Update FormData:", Object.fromEntries(formData));
      const response = await api.put("/updateGirviItem", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Update Girvi Response:", response.data);
      setGirvis((prev) =>
        prev.map((g) => (g._id === editGirvi._id ? response.data.girviItem : g))
      );
      setOpenEditModal(false);
      setEditGirvi(null);
      setFormErrors({});
      setTouchedFields({});
      setSaveAttempted(false);
      toast.success("Girvi updated successfully");
    } catch (err) {
      console.error("Update girvi error:", err);
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to update Girvi records."
          : err.response?.status === 403
          ? "Admin access required to update Girvi records."
          : err.response?.data?.message || "Failed to update Girvi.";
      console.log("Backend error details:", err.response?.data);
      setFormErrors((prev) => ({ ...prev, submit: errorMessage }));
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
    }
  };

  const handleDeleteGirvi = async (girviId) => {
    if (!window.confirm("Are you sure you want to delete this Girvi record?"))
      return;
    try {
      await api.get("/removeGirviItem", { params: { girviItemId: girviId } });
      setGirvis((prev) => prev.filter((girvi) => girvi._id !== girviId));
      setError(null);
      toast.success("Girvi deleted successfully");
    } catch (err) {
      console.error("Delete girvi error:", err);
      setError(err.response?.data?.message || "Failed to delete Girvi.");
      toast.error(err.response?.data?.message || "Failed to delete Girvi.");
    }
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setOpenEditModal(false);
    setNewGirvi({
      girviItemImg: null,
      itemName: "",
      itemType: "gold",
      itemWeight: "",
      itemValue: "",
      itemDescription: "",
      interestRate: "",
      Customer: "",
      firm: "",
      lastDateToTake: new Date().toISOString().slice(0, 10),
    });
    setEditGirvi(null);
    setFormErrors({});
    setTouchedFields({});
    setSaveAttempted(false);
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue("");
  };
  const handleFilterValueChange = (e) => setFilterValue(e.target.value);

  const filteredGirvis = girvis.filter(
    (girvi) =>
      (
        girvi.Customer?.name ||
        customers.find((c) => c._id === girvi.Customer)?.name ||
        ""
      )
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (girvi.firm?.name || firms.find((f) => f._id === girvi.firm)?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (girvi.itemName || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          Girvi Management
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
            onClick={handleAddGirvi}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: 1,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            disabled={!customers.length || !firms.length}
          >
            Add Girvi
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
              width: { xs: "100%", sm: 120 },
              py: 0.5,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            variant="outlined"
          >
            <MenuItem
              value="all"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              All Filters
            </MenuItem>
            <MenuItem
              value="customer"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Customer
            </MenuItem>
            <MenuItem
              value="date"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Date
            </MenuItem>
          </Select>
          {filterType === "customer" && (
            <Select
              value={filterValue}
              onChange={handleFilterValueChange}
              sx={{
                width: { xs: "100%", sm: 150 },
                py: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
              disabled={!customers.length}
            >
              <MenuItem
                value=""
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                Select Customer
              </MenuItem>
              {customers.map((customer) => (
                <MenuItem
                  key={customer._id}
                  value={customer._id}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  {customer.name || "Unnamed Customer"}
                </MenuItem>
              ))}
            </Select>
          )}
          {filterType === "date" && (
            <TextField
              type="date"
              value={filterValue}
              onChange={handleFilterValueChange}
              sx={{
                width: { xs: "100%", sm: 150 },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
              InputLabelProps={{ shrink: true }}
              label="Select Date"
              InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
            />
          )}
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
        ) : filteredGirvis.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
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
                  <TableCell>Image</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Item Type
                  </TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Firm
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Weight (g)
                  </TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Interest Rate (%)
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    Last Date to Take
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    Description
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGirvis.map((girvi) => (
                  <TableRow
                    key={girvi._id}
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
                    <TableCell>
                      {girvi.girviItemImg ? (
                        <Box
                          sx={{
                            width: { xs: 40, sm: 50 },
                            height: { xs: 40, sm: 50 },
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={`http://localhost:3002/${girvi.girviItemImg}`}
                            alt={`${girvi.itemName || "Girvi"} image`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              console.error(
                                `Failed to load image: ${girvi.girviItemImg}`
                              );
                              e.target.src = "/fallback-image.png";
                            }}
                          />
                        </Box>
                      ) : (
                        "No Image"
                      )}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {girvi.itemName || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {girvi.itemType || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {girvi.Customer?.name ||
                        customers.find((c) => c._id === girvi.Customer)?.name ||
                        "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {girvi.firm?.name ||
                        firms.find((f) => f._id === girvi.firm)?.name ||
                        "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {girvi.itemWeight || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      ₹{girvi.itemValue || "0"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {girvi.interestRate || "0"}%
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", lg: "table-cell" },
                      }}
                    >
                      {girvi.lastDateToTake
                        ? new Date(girvi.lastDateToTake).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", lg: "table-cell" },
                      }}
                    >
                      {girvi.itemDescription || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditGirvi(girvi)}
                        sx={{
                          color: theme.palette.secondary.main,
                          borderColor: theme.palette.secondary.main,
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                            borderColor: theme.palette.secondary.dark,
                          },
                          mr: { xs: 0.5, sm: 1 },
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          py: { xs: 0.5, sm: 1 },
                        }}
                        disabled={!customers.length || !firms.length}
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
                          "&:hover": {
                            bgcolor: theme.palette.error.light,
                            borderColor: theme.palette.error.dark,
                          },
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          py: { xs: 0.5, sm: 1 },
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
      </motion.div>

      {/* Add Girvi Modal */}
      <Dialog
        open={openAddModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { minWidth: { xs: 300, sm: 500 } } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Add New Girvi
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
            <Alert
              severity="error"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              {formErrors.submit}
            </Alert>
          )}
          {!customers.length && (
            <Alert
              severity="warning"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              No customers available. Please add customers first.
            </Alert>
          )}
          {!firms.length && (
            <Alert
              severity="warning"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              No firms available. Please add firms first.
            </Alert>
          )}
          <TextField
            name="itemName"
            label="Item Name"
            value={newGirvi.itemName}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("itemName")}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
            error={
              (touchedFields.itemName || saveAttempted) && !!formErrors.itemName
            }
            helperText={
              (touchedFields.itemName || saveAttempted) && formErrors.itemName
            }
            required
          />
          <Select
            name="itemType"
            value={newGirvi.itemType}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("itemType")}
            fullWidth
            sx={{
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            error={
              (touchedFields.itemType || saveAttempted) && !!formErrors.itemType
            }
            helperText={
              (touchedFields.itemType || saveAttempted) && formErrors.itemType
            }
            required
          >
            <MenuItem
              value="gold"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Gold
            </MenuItem>
            <MenuItem
              value="silver"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Silver
            </MenuItem>
            <MenuItem
              value="platinum"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Platinum
            </MenuItem>
            <MenuItem
              value="diamond"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Diamond
            </MenuItem>
            <MenuItem
              value="other"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Other
            </MenuItem>
          </Select>
          <TextField
            name="itemWeight"
            label="Weight (g)"
            type="number"
            value={newGirvi.itemWeight}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("itemWeight")}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={
              (touchedFields.itemWeight || saveAttempted) &&
              !!formErrors.itemWeight
            }
            helperText={
              (touchedFields.itemWeight || saveAttempted) &&
              formErrors.itemWeight
            }
            required
          />
          <TextField
            name="itemValue"
            label="Amount (₹)"
            type="number"
            value={newGirvi.itemValue}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("itemValue")}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={
              (touchedFields.itemValue || saveAttempted) &&
              !!formErrors.itemValue
            }
            helperText={
              (touchedFields.itemValue || saveAttempted) && formErrors.itemValue
            }
            required
          />
          <TextField
            name="itemDescription"
            label="Description"
            multiline
            rows={3}
            value={newGirvi.itemDescription}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("itemDescription")}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
            error={
              (touchedFields.itemDescription || saveAttempted) &&
              !!formErrors.itemDescription
            }
            helperText={
              (touchedFields.itemDescription || saveAttempted) &&
              formErrors.itemDescription
            }
            required
          />
          <TextField
            name="interestRate"
            label="Interest Rate (%)"
            type="number"
            value={newGirvi.interestRate}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("interestRate")}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={
              (touchedFields.interestRate || saveAttempted) &&
              !!formErrors.interestRate
            }
            helperText={
              (touchedFields.interestRate || saveAttempted) &&
              formErrors.interestRate
            }
            required
          />
          <Select
            name="Customer"
            value={newGirvi.Customer || ""}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("Customer")}
            fullWidth
            displayEmpty
            sx={{
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            error={
              (touchedFields.Customer || saveAttempted) && !!formErrors.Customer
            }
          >
            <MenuItem
              value=""
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Select Customer
            </MenuItem>
            {customers.length ? (
              customers.map((customer) => (
                <MenuItem
                  key={customer._id}
                  value={customer._id}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  {customer.name || "Unnamed Customer"}
                </MenuItem>
              ))
            ) : (
              <MenuItem
                value=""
                disabled
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                No customers available
              </MenuItem>
            )}
          </Select>
          {formErrors.Customer && (touchedFields.Customer || saveAttempted) && (
            <Typography
              color="error"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, mt: 0.5 }}
            >
              {formErrors.Customer}
            </Typography>
          )}
          <Select
            name="firm"
            value={newGirvi.firm || ""}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("firm")}
            fullWidth
            displayEmpty
            sx={{
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            error={(touchedFields.firm || saveAttempted) && !!formErrors.firm}
          >
            <MenuItem
              value=""
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Select Firm
            </MenuItem>
            {firms.length ? (
              firms.map((firm) => (
                <MenuItem
                  key={firm._id}
                  value={firm._id}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  {firm.name || "Unnamed Firm"}
                </MenuItem>
              ))
            ) : (
              <MenuItem
                value=""
                disabled
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                No firms available
              </MenuItem>
            )}
          </Select>
          {formErrors.firm && (touchedFields.firm || saveAttempted) && (
            <Typography
              color="error"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, mt: 0.5 }}
            >
              {formErrors.firm}
            </Typography>
          )}
          <TextField
            name="lastDateToTake"
            label="Last Date to Take"
            type="date"
            value={newGirvi.lastDateToTake}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("lastDateToTake")}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
            error={
              (touchedFields.lastDateToTake || saveAttempted) &&
              !!formErrors.lastDateToTake
            }
            helperText={
              (touchedFields.lastDateToTake || saveAttempted) &&
              formErrors.lastDateToTake
            }
            required
          />
          <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Button
              variant="contained"
              component="label"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.text.primary,
                "&:hover": { bgcolor: theme.palette.secondary.dark },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                width: { xs: "100%", sm: "auto" },
                py: { xs: 0.5, sm: 1 },
              }}
            >
              Upload Item Image
              <input
                type="file"
                hidden
                name="girviItemImg"
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
              {newGirvi.girviItemImg
                ? newGirvi.girviItemImg.name
                : "No file chosen"}
            </Typography>
            {newGirvi.girviItemImg && (
              <img
                src={URL.createObjectURL(newGirvi.girviItemImg)}
                alt="Item image preview"
                style={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: 4,
                  marginTop: 1,
                  objectFit: "contain",
                }}
                onError={(e) => {
                  console.error("Failed to preview image");
                  e.target.src = "/fallback-image.png";
                }}
              />
            )}
          </Box>
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
            onClick={handleSaveGirvi}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              textTransform: "none",
              py: { xs: 0.5, sm: 1 },
            }}
            disabled={!customers.length || !firms.length}
          >
            Save Girvi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Girvi Modal */}
      <Dialog
        open={openEditModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { minWidth: { xs: 300, sm: 500 } } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Edit Girvi
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
          {!customers.length && (
            <Alert
              severity="warning"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              No customers available. Please add customers first.
            </Alert>
          )}
          {!firms.length && (
            <Alert
              severity="warning"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              No firms available. Please add firms first.
            </Alert>
          )}
          {editGirvi && (
            <>
              <TextField
                name="itemName"
                label="Item Name"
                value={editGirvi.itemName}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("itemName")}
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                InputProps={{
                  sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedFields.itemName || saveAttempted) &&
                  !!formErrors.itemName
                }
                helperText={
                  (touchedFields.itemName || saveAttempted) &&
                  formErrors.itemName
                }
                required
              />
              <Select
                name="itemType"
                value={editGirvi.itemType}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("itemType")}
                fullWidth
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
                error={
                  (touchedFields.itemType || saveAttempted) &&
                  !!formErrors.itemType
                }
                helperText={
                  (touchedFields.itemType || saveAttempted) &&
                  formErrors.itemType
                }
                required
              >
                <MenuItem
                  value="gold"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Gold
                </MenuItem>
                <MenuItem
                  value="silver"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Silver
                </MenuItem>
                <MenuItem
                  value="platinum"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Platinum
                </MenuItem>
                <MenuItem
                  value="diamond"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Diamond
                </MenuItem>
                <MenuItem
                  value="other"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Other
                </MenuItem>
              </Select>
              <TextField
                name="itemWeight"
                label="Weight (g)"
                type="number"
                value={editGirvi.itemWeight}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("itemWeight")}
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                InputProps={{
                  inputProps: { min: 0 },
                  sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedFields.itemWeight || saveAttempted) &&
                  !!formErrors.itemWeight
                }
                helperText={
                  (touchedFields.itemWeight || saveAttempted) &&
                  formErrors.itemWeight
                }
                required
              />
              <TextField
                name="itemValue"
                label="Amount (₹)"
                type="number"
                value={editGirvi.itemValue}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("itemValue")}
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                InputProps={{
                  inputProps: { min: 0 },
                  sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedFields.itemValue || saveAttempted) &&
                  !!formErrors.itemValue
                }
                helperText={
                  (touchedFields.itemValue || saveAttempted) &&
                  formErrors.itemValue
                }
                required
              />
              <TextField
                name="itemDescription"
                label="Description"
                multiline
                rows={3}
                value={editGirvi.itemDescription}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("itemDescription")}
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                InputProps={{
                  sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedFields.itemDescription || saveAttempted) &&
                  !!formErrors.itemDescription
                }
                helperText={
                  (touchedFields.itemDescription || saveAttempted) &&
                  formErrors.itemDescription
                }
                required
              />
              <TextField
                name="interestRate"
                label="Interest Rate (%)"
                type="number"
                value={editGirvi.interestRate}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("interestRate")}
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                InputProps={{
                  inputProps: { min: 0 },
                  sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedFields.interestRate || saveAttempted) &&
                  !!formErrors.interestRate
                }
                helperText={
                  (touchedFields.interestRate || saveAttempted) &&
                  formErrors.interestRate
                }
                required
              />
              <Select
                name="Customer"
                value={editGirvi.Customer || ""}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("Customer")}
                fullWidth
                displayEmpty
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
                error={
                  (touchedFields.Customer || saveAttempted) &&
                  !!formErrors.Customer
                }
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Select Customer
                </MenuItem>
                {customers.length ? (
                  customers.map((customer) => (
                    <MenuItem
                      key={customer._id}
                      value={customer._id}
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      {customer.name || "Unnamed Customer"}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem
                    value=""
                    disabled
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  >
                    No customers available
                  </MenuItem>
                )}
              </Select>
              {formErrors.Customer &&
                (touchedFields.Customer || saveAttempted) && (
                  <Typography
                    color="error"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, mt: 0.5 }}
                  >
                    {formErrors.Customer}
                  </Typography>
                )}
              <Select
                name="firm"
                value={editGirvi.firm || ""}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("firm")}
                fullWidth
                displayEmpty
                sx={{
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
                error={
                  (touchedFields.firm || saveAttempted) && !!formErrors.firm
                }
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Select Firm
                </MenuItem>
                {firms.length ? (
                  firms.map((firm) => (
                    <MenuItem
                      key={firm._id}
                      value={firm._id}
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      {firm.name || "Unnamed Firm"}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem
                    value=""
                    disabled
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  >
                    No firms available
                  </MenuItem>
                )}
              </Select>
              {formErrors.firm && (touchedFields.firm || saveAttempted) && (
                <Typography
                  color="error"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, mt: 0.5 }}
                >
                  {formErrors.firm}
                </Typography>
              )}
              <TextField
                name="lastDateToTake"
                label="Last Date to Take"
                type="date"
                value={editGirvi.lastDateToTake}
                onChange={(e) => handleInputChange(e, true)}
                onBlur={() => handleFieldBlur("lastDateToTake")}
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedFields.lastDateToTake || saveAttempted) &&
                  !!formErrors.lastDateToTake
                }
                helperText={
                  (touchedFields.lastDateToTake || saveAttempted) &&
                  formErrors.lastDateToTake
                }
                required
              />
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                    "&:hover": { bgcolor: theme.palette.secondary.dark },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    width: { xs: "100%", sm: "auto" },
                    py: { xs: 0.5, sm: 1 },
                  }}
                >
                  Upload New Item Image
                  <input
                    type="file"
                    hidden
                    name="girviItemImg"
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
                  {editGirvi.girviItemImg
                    ? editGirvi.girviItemImg.name
                    : "No new file chosen"}
                </Typography>
                {editGirvi.girviItemImg && (
                  <img
                    src={URL.createObjectURL(editGirvi.girviItemImg)}
                    alt="Item image preview"
                    style={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      borderRadius: 4,
                      marginTop: 1,
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      console.error("Failed to preview image");
                      e.target.src = "/fallback-image.png";
                    }}
                  />
                )}
              </Box>
            </>
          )}
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
            onClick={handleUpdateGirvi}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              textTransform: "none",
              py: { xs: 0.5, sm: 1 },
            }}
            disabled={!customers.length || !firms.length}
          >
            Update Girvi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GirviManagement;
