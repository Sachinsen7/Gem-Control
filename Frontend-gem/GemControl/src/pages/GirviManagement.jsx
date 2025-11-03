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
  CircularProgress,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardContent,
  Collapse,
  IconButton as ExpandIconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add, Delete, Edit, ExpandMore } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import NotificationModal from "../components/NotificationModal";
import { OptimizedImage } from "../utils/imageUtils";
import ImageDebugger from "../components/ImageDebugger";

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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
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
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
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
      const firmsData = Array.isArray(firmResponse.data)
        ? firmResponse.data
        : [];
      const customersData = Array.isArray(customerResponse.data)
        ? customerResponse.data.filter((customer) =>
            firmsData.some((firm) => firm._id === customer.firm?._id)
          )
        : [];

      const girviData = Array.isArray(girviResponse.data)
        ? girviResponse.data
        : [];

      // Debug: Log image URLs to see what we're getting
      console.log(
        "Girvi items with images:",
        girviData.map((item) => ({
          id: item._id,
          name: item.itemName,
          imageUrl: item.itemImage,
          imageType: typeof item.itemImage,
        }))
      );

      setGirvis(girviData);
      setCustomers(customersData);
      setFirms(firmsData);

      setNewGirvi((prev) => ({
        ...prev,
        Customer: customersData.length ? customersData[0]._id : "",
        firm: firmsData.length ? firmsData[0]._id : "",
      }));

      if (!customersData.length) {
        setErrorMessage("No customers available. Please add customers first.");
        setIsErrorModalOpen(true);
      }
      if (!firmsData.length) {
        setErrorMessage("No firms available. Please add firms first.");
        setIsErrorModalOpen(true);
      }
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to access data."
          : err.response?.data?.message || "Failed to load data.";
      setErrorMessage(errorMessage);
      setIsErrorModalOpen(true);
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
        setGirvis(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || "Failed to apply filter."
        );
        setIsErrorModalOpen(true);
      } finally {
        setLoading(false);
      }
    };
    if (filterType !== "all" && filterValue) {
      handleFilter();
    } else if (filterType === "all" && !filterValue) {
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
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    const updateState = (prev) => {
      let updated = { ...prev, [name]: value };
      if (
        name === "Customer" &&
        value &&
        !customers.some((c) => c._id === value)
      ) {
        setErrorMessage("Selected customer is invalid.");
        setIsErrorModalOpen(true);
        updated = { ...prev, Customer: "" };
      } else if (
        name === "firm" &&
        value &&
        !firms.some((f) => f._id === value)
      ) {
        setErrorMessage("Selected firm is invalid.");
        setIsErrorModalOpen(true);
        updated = { ...prev, firm: "" };
      }
      return updated;
    };

    if (isEdit) {
      setEditGirvi((prev) => {
        const updated = updateState(prev);
        validateForm(updated, true);
        return updated;
      });
    } else {
      setNewGirvi((prev) => {
        const updated = updateState(prev);
        validateForm(updated, false);
        return updated;
      });
    }
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditGirvi((prev) => ({ ...prev, girviItemImg: file }));
      } else {
        setNewGirvi((prev) => ({ ...prev, girviItemImg: file }));
      }
      setTouchedFields((prev) => ({ ...prev, girviItemImg: true }));
      setFormErrors((prev) => ({ ...prev, girviItemImg: null }));
    }
  };

  const handleFieldBlur = (name) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    validateForm(openEditModal ? editGirvi : newGirvi, openEditModal);
  };

  const handleSaveGirvi = async () => {
    setSaveAttempted(true);
    if (!validateForm(newGirvi)) {
      setErrorMessage("Please fill all required fields correctly.");
      setIsErrorModalOpen(true);
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

      const response = await api.post("/AddGirviItem", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
        Customer: customers.length ? customers[0]._id : "",
        firm: firms.length ? firms[0]._id : "",
        lastDateToTake: new Date().toISOString().slice(0, 10),
      });
      setFormErrors({});
      setTouchedFields({});
      setSaveAttempted(false);
      setSuccessMessage("Girvi created successfully");
      setIsSuccessModalOpen(true);
    } catch (err) {
      const errorMessage =
        err.response?.status === 400
          ? err.response.data.message
          : err.response?.status === 401
          ? "Please log in to add Girvi records."
          : err.response?.status === 403
          ? "Admin access required to add Girvi records."
          : err.response?.data?.message || "Failed to create Girvi.";
      setErrorMessage(errorMessage);
      setIsErrorModalOpen(true);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
    }
  };

  const handleAddGirvi = () => {
    if (!currentUser) {
      setErrorMessage("Please log in to add Girvi records.");
      setIsErrorModalOpen(true);
      dispatch(setAuthError("Please log in to add Girvi records."));
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!customers.length || !firms.length) {
      setErrorMessage(
        "No customers or firms available. Please add them first."
      );
      setIsErrorModalOpen(true);
      return;
    }
    setNewGirvi({
      girviItemImg: null,
      itemName: "",
      itemType: "gold",
      itemWeight: "",
      itemValue: "",
      itemDescription: "",
      interestRate: "",
      Customer: customers.length ? customers[0]._id : "",
      firm: firms.length ? firms[0]._id : "",
      lastDateToTake: new Date().toISOString().slice(0, 10),
    });
    setFormErrors({});
    setTouchedFields({});
    setSaveAttempted(false);
    setOpenAddModal(true);
  };

  const handleEditGirvi = (girvi) => {
    if (!currentUser) {
      setErrorMessage("Please log in to edit Girvi records.");
      setIsErrorModalOpen(true);
      dispatch(setAuthError("Please log in to edit Girvi records."));
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!customers.length || !firms.length) {
      setErrorMessage(
        "No customers or firms available. Please add them first."
      );
      setIsErrorModalOpen(true);
      return;
    }
    setEditGirvi({
      _id: girvi._id,
      girviItemImg: null,
      itemName: girvi.itemName || "",
      itemType: girvi.itemType || "gold",
      itemWeight: girvi.itemWeight || "",
      itemValue: girvi.itemValue || "",
      itemDescription: girvi.itemDescription || "",
      interestRate: girvi.interestRate || "",
      Customer:
        girvi.Customer?._id ||
        girvi.Customer ||
        (customers.length ? customers[0]._id : ""),
      firm: girvi.firm?._id || girvi.firm || (firms.length ? firms[0]._id : ""),
      lastDateToTake: girvi.lastDateToTake
        ? new Date(girvi.lastDateToTake).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    });
    setFormErrors({});
    setTouchedFields({});
    setSaveAttempted(false);
    setOpenEditModal(true);
  };

  const handleUpdateGirvi = async () => {
    setSaveAttempted(true);
    if (!validateForm(editGirvi, true)) {
      setErrorMessage("Please fill all required fields correctly.");
      setIsErrorModalOpen(true);
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

      const response = await api.put("/updateGirviItem", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGirvis((prev) =>
        prev.map((g) => (g._id === editGirvi._id ? response.data.girviItem : g))
      );
      setOpenEditModal(false);
      setEditGirvi(null);
      setFormErrors({});
      setTouchedFields({});
      setSaveAttempted(false);
      setSuccessMessage("Girvi updated successfully");
      setIsSuccessModalOpen(true);
    } catch (err) {
      const errorMessage =
        err.response?.status === 400
          ? err.response.data.message
          : err.response?.status === 401
          ? "Please log in to update Girvi records."
          : err.response?.status === 403
          ? "Admin access required to update Girvi records."
          : err.response?.data?.message || "Failed to update Girvi.";
      setErrorMessage(errorMessage);
      setIsErrorModalOpen(true);
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
      setSuccessMessage("Girvi deleted successfully");
      setIsSuccessModalOpen(true);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to delete Girvi records."
          : err.response?.status === 403
          ? "Admin access required to delete Girvi records."
          : err.response?.data?.message || "Failed to delete Girvi.";
      setErrorMessage(errorMessage);
      setIsErrorModalOpen(true);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
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
      Customer: customers.length ? customers[0]._id : "",
      firm: firms.length ? firms[0]._id : "",
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
  const handleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

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
        py: { xs: 2, sm: 3 },
      }}
    >
      <NotificationModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
        type="error"
      />
      <NotificationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
        type="success"
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 3 },
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
            fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.25rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Borrows Management
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 1, sm: 2 },
            width: { xs: "100%", sm: "auto" },
            flexWrap: "wrap",
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
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
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
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                }}
              />
            </IconButton>
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                color: theme.palette.text.primary,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
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
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
            variant="outlined"
          >
            <MenuItem
              value="all"
              sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
            >
              All Filters
            </MenuItem>
            <MenuItem
              value="customer"
              sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
            >
              Customer
            </MenuItem>
            <MenuItem
              value="date"
              sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
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
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
              disabled={!customers.length}
            >
              <MenuItem
                value=""
                sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
              >
                Select Customer
              </MenuItem>
              {customers.map((customer) => (
                <MenuItem
                  key={customer._id}
                  value={customer._id}
                  sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
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
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
              InputLabelProps={{ shrink: true }}
              label="Select Date"
              InputProps={{ sx: { fontSize: { xs: "0.85rem", sm: "0.9rem" } } }}
            />
          )}
        </Box>
      </Box>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
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
        ) : filteredGirvis.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 3 },
              fontSize: { xs: "0.85rem", sm: "1rem" },
            }}
          >
            No Girvi records found.
          </Typography>
        ) : (
          <>
            {/* Desktop View (Table) */}
            <TableContainer
              component={Paper}
              sx={{
                width: "100%",
                boxShadow: theme.shadows[4],
                "&:hover": { boxShadow: theme.shadows[8] },
                overflowX: "auto",
                display: { xs: "none", sm: "block" },
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
                        fontSize: { xs: "0.75rem", sm: "0.9rem" },
                        px: { xs: 1, sm: 2 },
                        py: 1,
                      },
                    }}
                  >
                    <TableCell>Image</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Item Type</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Firm</TableCell>
                    <TableCell>Weight (g)</TableCell>
                    <TableCell>Amount (₹)</TableCell>
                    <TableCell>Interest Rate (%)</TableCell>
                    <TableCell>Last Date to Take</TableCell>
                    <TableCell>Description</TableCell>
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
                          fontSize: { xs: "0.75rem", sm: "0.9rem" },
                          px: { xs: 1, sm: 2 },
                          py: 1,
                        },
                      }}
                    >
                      <TableCell>
                        {girvi.itemImage ? (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <OptimizedImage
                              src={girvi.itemImage}
                              alt={`${girvi.itemName || "Girvi"} item`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
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
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {girvi.itemType || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {girvi.Customer?.name ||
                          customers.find((c) => c._id === girvi.Customer)
                            ?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {girvi.firm?.name ||
                          firms.find((f) => f._id === girvi.firm)?.name ||
                          "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {girvi.itemWeight || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        ₹{girvi.itemValue || "0"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {girvi.interestRate || "0"}%
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {girvi.lastDateToTake
                          ? new Date(girvi.lastDateToTake).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
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
                            mr: 1,
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

            {/* Mobile View (Cards) */}
            <Box sx={{ display: { xs: "block", sm: "none" }, mt: 2 }}>
              {filteredGirvis.map((girvi) => (
                <Card
                  key={girvi._id}
                  component={motion.div}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  sx={{
                    mb: 2,
                    borderRadius: 4,
                    boxShadow: theme.shadows[3],
                    "&:hover": { boxShadow: theme.shadows[6] },
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {girvi.itemImage ? (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <OptimizedImage
                              src={girvi.itemImage}
                              alt={`${girvi.itemName || "Girvi"} item`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                          >
                            No Image
                          </Typography>
                        )}
                        <Box>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                              fontWeight: "bold",
                            }}
                          >
                            {girvi.itemName || "N/A"}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              color: theme.palette.text.secondary,
                            }}
                          >
                            ₹{girvi.itemValue || "0"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditGirvi(girvi)}
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            py: 0.5,
                            px: 1,
                            textTransform: "none",
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
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            py: 0.5,
                            px: 1,
                            textTransform: "none",
                          }}
                        >
                          Delete
                        </Button>
                        <ExpandIconButton
                          onClick={() => handleExpandCard(girvi._id)}
                          sx={{
                            transform:
                              expandedCard === girvi._id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.3s",
                          }}
                        >
                          <ExpandMore
                            sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
                          />
                        </ExpandIconButton>
                      </Box>
                    </Box>
                    <Collapse in={expandedCard === girvi._id} timeout="auto">
                      <Box sx={{ mt: 1, pl: 1 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Item Type: {girvi.itemType || "N/A"}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Customer:{" "}
                          {girvi.Customer?.name ||
                            customers.find((c) => c._id === girvi.Customer)
                              ?.name ||
                            "N/A"}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Firm:{" "}
                          {girvi.firm?.name ||
                            firms.find((f) => f._id === girvi.firm)?.name ||
                            "N/A"}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Weight: {girvi.itemWeight || "N/A"} g
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Interest Rate: {girvi.interestRate || "0"}%
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Last Date:{" "}
                          {girvi.lastDateToTake
                            ? new Date(
                                girvi.lastDateToTake
                              ).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Description: {girvi.itemDescription || "N/A"}
                        </Typography>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
        {filteredGirvis.length > 0 && (
          <Box
            sx={{
              mt: 2,
              textAlign: "center",
              color: theme.palette.text.secondary,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Total Girvis: {filteredGirvis.length}
          </Box>
        )}
      </motion.div>

      {/* Add Girvi Modal */}
      <Dialog
        open={openAddModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { minWidth: { xs: 280, sm: 500 }, zIndex: 1300 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "0.9rem", sm: "1.1rem" },
          }}
        >
          Add New Girvi
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
          {(touchedFields.submit || saveAttempted) &&
            Object.keys(formErrors).length > 0 && (
              <NotificationModal
                isOpen={true}
                onClose={() => setSaveAttempted(false)}
                title="Form Error"
                message="Please fill all required fields correctly."
                type="error"
              />
            )}
          {!customers.length && (
            <NotificationModal
              isOpen={true}
              onClose={() => {}}
              title="Warning"
              message="No customers available. Please add customers first."
              type="warning"
            />
          )}
          {!firms.length && (
            <NotificationModal
              isOpen={true}
              onClose={() => {}}
              title="Warning"
              message="No firms available. Please add firms first."
              type="warning"
            />
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
            InputLabelProps={{
              sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={
              (touchedFields.itemName || saveAttempted) && !!formErrors.itemName
            }
            helperText={
              (touchedFields.itemName || saveAttempted) && formErrors.itemName
            }
            required
          />
          <FormControl
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            error={
              (touchedFields.itemType || saveAttempted) && !!formErrors.itemType
            }
          >
            <InputLabel
              id="item-type-label"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Item Type
            </InputLabel>
            <Select
              labelId="item-type-label"
              name="itemType"
              value={newGirvi.itemType}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("itemType")}
              label="Item Type"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
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
            {(touchedFields.itemType || saveAttempted) &&
              formErrors.itemType && (
                <FormHelperText
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                >
                  {formErrors.itemType}
                </FormHelperText>
              )}
          </FormControl>
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
            InputLabelProps={{
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
            InputLabelProps={{
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
            InputLabelProps={{
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
            value={newGirvi.interestRate}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur("interestRate")}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            InputLabelProps={{
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
          <FormControl
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 }, zIndex: 1300 }}
            error={
              (touchedFields.Customer || saveAttempted) && !!formErrors.Customer
            }
          >
            <InputLabel
              id="customer-label"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Select Customer
            </InputLabel>
            <Select
              labelId="customer-label"
              name="Customer"
              value={newGirvi.Customer || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("Customer")}
              fullWidth
              label="Select Customer"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              disabled={!customers.length}
            >
              <MenuItem
                value=""
                disabled
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
                  {customer.name || "Unnamed Customer"} (Firm:{" "}
                  {customer.firm?.name || "N/A"})
                </MenuItem>
              ))}
            </Select>
            {(touchedFields.Customer || saveAttempted) &&
              formErrors.Customer && (
                <FormHelperText
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                >
                  {formErrors.Customer}
                </FormHelperText>
              )}
          </FormControl>
          <FormControl
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 2 }, zIndex: 1300 }}
            error={(touchedFields.firm || saveAttempted) && !!formErrors.firm}
          >
            <InputLabel
              id="firm-label"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Select Firm
            </InputLabel>
            <Select
              labelId="firm-label"
              name="firm"
              value={newGirvi.firm || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("firm")}
              fullWidth
              label="Select Firm"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              disabled={!firms.length}
            >
              <MenuItem
                value=""
                disabled
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                Select Firm
              </MenuItem>
              {firms.map((firm) => (
                <MenuItem
                  key={firm._id}
                  value={firm._id}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  {firm.name || "Unnamed Firm"}
                </MenuItem>
              ))}
            </Select>
            {(touchedFields.firm || saveAttempted) && formErrors.firm && (
              <FormHelperText sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
                {formErrors.firm}
              </FormHelperText>
            )}
          </FormControl>
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
                onChange={(e) => handleFileChange(e)}
                accept="image/*"
              />
            </Button>
            {newGirvi.girviItemImg ? (
              <Box
                sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <img
                  src={URL.createObjectURL(newGirvi.girviItemImg)}
                  alt="Item preview"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: 4,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => (e.target.src = "/fallback-image.png")}
                />
                <Typography
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    color: theme.palette.text.secondary,
                  }}
                >
                  {newGirvi.girviItemImg.name}
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                No file chosen
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1.5, sm: 2 },
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
              py: { xs: 0.5, sm: 1 },
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
        PaperProps={{ sx: { minWidth: { xs: 280, sm: 500 }, zIndex: 1300 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "0.9rem", sm: "1.1rem" },
          }}
        >
          Edit Girvi
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
          {(touchedFields.submit || saveAttempted) &&
            Object.keys(formErrors).length > 0 && (
              <NotificationModal
                isOpen={true}
                onClose={() => setSaveAttempted(false)}
                title="Form Error"
                message="Please fill all required fields correctly."
                type="error"
              />
            )}
          {!customers.length && (
            <NotificationModal
              isOpen={true}
              onClose={() => {}}
              title="Warning"
              message="No customers available. Please add customers first."
              type="warning"
            />
          )}
          {!firms.length && (
            <NotificationModal
              isOpen={true}
              onClose={() => {}}
              title="Warning"
              message="No firms available. Please add firms first."
              type="warning"
            />
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
                InputLabelProps={{
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
              <FormControl
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                error={
                  (touchedFields.itemType || saveAttempted) &&
                  !!formErrors.itemType
                }
              >
                <InputLabel
                  id="edit-item-type-label"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Item Type
                </InputLabel>
                <Select
                  labelId="edit-item-type-label"
                  name="itemType"
                  value={editGirvi.itemType}
                  onChange={(e) => handleInputChange(e, true)}
                  onBlur={() => handleFieldBlur("itemType")}
                  label="Item Type"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
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
                {(touchedFields.itemType || saveAttempted) &&
                  formErrors.itemType && (
                    <FormHelperText
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                    >
                      {formErrors.itemType}
                    </FormHelperText>
                  )}
              </FormControl>
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
                InputLabelProps={{
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
                InputLabelProps={{
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
                InputLabelProps={{
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
                InputLabelProps={{
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
              <FormControl
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 }, zIndex: 1300 }}
                error={
                  (touchedFields.Customer || saveAttempted) &&
                  !!formErrors.Customer
                }
              >
                <InputLabel
                  id="edit-customer-label"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Select Customer
                </InputLabel>
                <Select
                  labelId="edit-customer-label"
                  name="Customer"
                  value={editGirvi?.Customer || ""}
                  onChange={(e) => handleInputChange(e, true)}
                  onBlur={() => handleFieldBlur("Customer")}
                  fullWidth
                  label="Select Customer"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  disabled={!customers.length}
                >
                  <MenuItem
                    value=""
                    disabled
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
                      {customer.name || "Unnamed Customer"} (Firm:{" "}
                      {customer.firm?.name || "N/A"})
                    </MenuItem>
                  ))}
                </Select>
                {(touchedFields.Customer || saveAttempted) &&
                  formErrors.Customer && (
                    <FormHelperText
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                    >
                      {formErrors.Customer}
                    </FormHelperText>
                  )}
              </FormControl>
              <FormControl
                fullWidth
                sx={{ mb: { xs: 1.5, sm: 2 }, zIndex: 1300 }}
                error={
                  (touchedFields.firm || saveAttempted) && !!formErrors.firm
                }
              >
                <InputLabel
                  id="edit-firm-label"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  Select Firm
                </InputLabel>
                <Select
                  labelId="edit-firm-label"
                  name="firm"
                  value={editGirvi?.firm || ""}
                  onChange={(e) => handleInputChange(e, true)}
                  onBlur={() => handleFieldBlur("firm")}
                  fullWidth
                  label="Select Firm"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  disabled={!firms.length}
                >
                  <MenuItem
                    value=""
                    disabled
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  >
                    Select Firm
                  </MenuItem>
                  {firms.map((firm) => (
                    <MenuItem
                      key={firm._id}
                      value={firm._id}
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      {firm.name || "Unnamed Firm"}
                    </MenuItem>
                  ))}
                </Select>
                {(touchedFields.firm || saveAttempted) && formErrors.firm && (
                  <FormHelperText
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                  >
                    {formErrors.firm}
                  </FormHelperText>
                )}
              </FormControl>
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
                    onChange={(e) => handleFileChange(e, true)}
                    accept="image/*"
                  />
                </Button>
                {editGirvi.girviItemImg ? (
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <img
                      src={URL.createObjectURL(editGirvi.girviItemImg)}
                      alt="Item preview"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: 4,
                        objectFit: "contain",
                        border: "1px solid #ddd",
                      }}
                      onError={(e) => (e.target.src = "/fallback-image.png")}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.8rem" },
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {editGirvi.girviItemImg.name}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: theme.palette.text.secondary,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    }}
                  >
                    No new file chosen
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1.5, sm: 2 },
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
              py: { xs: 0.5, sm: 1 },
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
            Update Borrows
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GirviManagement;
