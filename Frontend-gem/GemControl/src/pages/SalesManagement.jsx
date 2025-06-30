import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Pagination,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  InputBase
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add } from "@mui/icons-material";
import api from "../utils/api";
import { toast } from "react-toastify";

function useDebounce(value, wait = 500) {
  const [debounceValue, setDebounceValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounceValue(value), wait);
    return () => clearTimeout(timer);
  }, [value, wait]);
  return debounceValue;
}

function SalesManagement() {
  const theme = useTheme();
  const [sales, setSales] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSaleModal, setOpenSaleModal] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [newSale, setNewSale] = useState({
    customer: "",
    firm: "",
    items: [{ saleType: "stock", salematerialId: "", quantity: "", amount: "" }],
    totalAmount: "",
    UdharAmount: "",
    paymentMethod: "cash",
    paymentRefrence: "",
    paymentAmount: "",
  });
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    contact: "",
    firm: "",
    address: "",
  });
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [touchedSaleFields, setTouchedSaleFields] = useState({});
  const [touchedCustomerFields, setTouchedCustomerFields] = useState({});
  const [saveAttemptedSale, setSaveAttemptedSale] = useState(false);
  const [saveAttemptedCustomer, setSaveAttemptedCustomer] = useState(false);

  const debouncedFilterValue = useDebounce(filterValue, 500);
  const debouncedCustomerSearchQuery = useDebounce(customerSearchQuery, 300);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [salesRes, customersRes, firmsRes, materialsRes, stocksRes] = await Promise.all([
          api.get("/getAllSales"),
          api.get("/getAllCustomers"),
          api.get("/getAllFirms"),
          api.get("/getAllRawMaterials"),
          api.get("/getAllStocks"),
        ]);
        setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
        setFirms(Array.isArray(firmsRes.data) ? firmsRes.data : []);
        setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
        setStocks(Array.isArray(stocksRes.data) ? stocksRes.data : []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch initial data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (filterType !== "all" && filterValue) {
      handleFilter(filterType, filterValue);
    } else if (filterType === "all") {
      fetchSales();
    }
  }, [debouncedFilterValue, filterType, filterValue]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllSales");
      setSales(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (type, value) => {
    try {
      setLoading(true);
      let response;
      if (type === "customer" && value) {
        response = await api.get("/getSaleByCustomer", { params: { customerId: value } });
      } else if (type === "firm" && value) {
        response = await api.get("/getSaleByFirm", { params: { firmId: value } });
      } else if (type === "date" && value) {
        const formattedDate = new Date(value).toISOString().slice(0, 10);
        response = await api.get("/getSaleByDate", { params: { date: formattedDate } });
      } else {
        response = await api.get("/getAllSales");
      }
      setSales(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying filter");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleOpenSaleModal = () => setOpenSaleModal(true);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    setNewSale((prev) => {
      if (typeof index === "number") {
        const updatedItems = [...prev.items];
        updatedItems[index] = { ...updatedItems[index], [name]: value };
        return { ...prev, items: updatedItems };
      }
      return { ...prev, [name]: value };
    });
    setTouchedSaleFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleCustomerSelect = (customerId) => {
    setNewSale((prev) => ({ ...prev, customer: customerId }));
    setCustomerSearchQuery("");
    setShowAllCustomers(false);
    setTouchedSaleFields((prev) => ({ ...prev, customer: true }));
  };

  const handleAddItem = () => {
    setNewSale((prev) => ({
      ...prev,
      items: [...prev.items, { saleType: "stock", salematerialId: "", quantity: "", amount: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    setNewSale((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSaveSale = async () => {
    setSaveAttemptedSale(true);
    try {
      if (!newSale.customer || !newSale.firm) {
        toast.error("Customer and Firm are required");
        return;
      }
      if (!newSale.items.length || newSale.items.some((item) => !item.salematerialId || !item.quantity || !item.amount)) {
        toast.error("All items must have material, quantity, and amount");
        return;
      }
      if (!newSale.totalAmount || isNaN(newSale.totalAmount) || parseFloat(newSale.totalAmount) <= 0) {
        toast.error("Valid total amount is required");
        return;
      }
      if (!newSale.paymentMethod) {
        toast.error("Payment method is required");
        return;
      }
      const saleData = {
        customer: newSale.customer,
        firm: newSale.firm,
        items: newSale.items.map((item) => ({
          saleType: item.saleType,
          salematerialId: item.salematerialId,
          quantity: parseFloat(item.quantity),
          amount: parseFloat(item.amount),
        })),
        totalAmount: parseFloat(newSale.totalAmount),
        UdharAmount: parseFloat(newSale.UdharAmount) || 0,
        paymentMethod: newSale.paymentMethod,
        paymentRefrence: newSale.paymentRefrence || `PAY-${Date.now()}`,
        paymentAmount: parseFloat(newSale.paymentAmount) || 0,
      };
      const response = await api.post("/createSale", saleData);
      setSales((prev) => [...prev, response.data.sale]);
      setOpenSaleModal(false);
      setNewSale({
        customer: "",
        firm: "",
        items: [{ saleType: "stock", salematerialId: "", quantity: "", amount: "" }],
        totalAmount: "",
        UdharAmount: "",
        paymentMethod: "cash",
        paymentRefrence: "",
        paymentAmount: "",
      });
      setCustomerSearchQuery("");
      setShowAllCustomers(false);
      setTouchedSaleFields({});
      setSaveAttemptedSale(false);
      toast.success("Sale created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create sale");
    }
  };

  const handleCancel = () => {
    setOpenSaleModal(false);
    setNewSale({
      customer: "",
      firm: "",
      items: [{ saleType: "stock", salematerialId: "", quantity: "", amount: "" }],
      totalAmount: "",
      UdharAmount: "",
      paymentMethod: "cash",
      paymentRefrence: "",
      paymentAmount: "",
    });
    setCustomerSearchQuery("");
    setShowAllCustomers(false);
    setTouchedSaleFields({});
    setSaveAttemptedSale(false);
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
    setTouchedCustomerFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleSaveCustomer = async () => {
    setSaveAttemptedCustomer(true);
    try {
      if (!newCustomer.name || !newCustomer.email || !newCustomer.contact || !newCustomer.firm || !newCustomer.address) {
        toast.error("All customer fields are required");
        return;
      }
      setCustomerLoading(true);
      const response = await api.post("/AddCustomer", {
        name: newCustomer.name,
        email: newCustomer.email,
        contact: newCustomer.contact,
        firm: newCustomer.firm,
        address: newCustomer.address,
      });
      const createdCustomer = response.data.customer;
      setCustomers((prev) => [...prev, createdCustomer]);
      setNewSale((prev) => ({ ...prev, customer: createdCustomer._id }));
      setOpenCustomerModal(false);
      setNewCustomer({ name: "", email: "", contact: "", firm: "", address: "" });
      setCustomerSearchQuery("");
      setShowAllCustomers(false);
      setTouchedCustomerFields({});
      setSaveAttemptedCustomer(false);
      toast.success("Customer created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create customer");
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleCancelCustomer = () => {
    setOpenCustomerModal(false);
    setNewCustomer({ name: "", email: "", contact: "", firm: "", address: "" });
    setTouchedCustomerFields({});
    setSaveAttemptedCustomer(false);
  };

  const handleCustomerSearch = (e) => {
    setCustomerSearchQuery(e.target.value);
    if (e.target.value) {
      setShowAllCustomers(true);
    }
  };

  const handleSaleFieldBlur = (fieldName, index = null) => {
    setTouchedSaleFields((prev) => ({
      ...prev,
      [index !== null ? `items[${index}].${fieldName}` : fieldName]: true,
    }));
  };

  const handleCustomerFieldBlur = (fieldName) => {
    setTouchedCustomerFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(debouncedCustomerSearchQuery.toLowerCase())
  );

  const filteredSales = sales.filter(
    (sale) =>
      (sale.customer?.name || customers.find((c) => c._id === sale.customer)?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.firm?.name || firms.find((f) => f._id === sale.firm)?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.paymentRefrence || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomer = customers.find((c) => c._id === newSale.customer);

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", width: "100%", px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}>
          Sales Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenSaleModal}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.white,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
            }}
          >
            Create Sale
          </Button>
          <Paper
            sx={{
              p: "6px 10px",
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
              placeholder="Search sales..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue("");
            }}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
              minWidth: 120,
              py: 0.5,
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Filters</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="firm">Firm</MenuItem>
            <MenuItem value="date">Date</MenuItem>
          </Select>
          {filterType === "customer" && (
            <Select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              sx={{ width: 150, py: 0.5 }}
            >
              <MenuItem value="">Select Customer</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id}>{customer.name}</MenuItem>
              ))}
            </Select>
          )}
          {filterType === "firm" && (
            <Select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              sx={{ width: 150, py: 0.5 }}
            >
              <MenuItem value="">Select Firm</MenuItem>
              {firms.map((firm) => (
                <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
              ))}
            </Select>
          )}
          {filterType === "date" && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                sx={{ width: 150 }}
                InputLabelProps={{ shrink: true }}
                label="Select Date"
              />
              <Button
                variant="contained"
                onClick={() => { if (filterValue) handleFilter("date", filterValue); }}
                disabled={!filterValue}
                sx={{ py: 1, textTransform: "none" }}
              >
                Apply
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <TableContainer component={Paper} sx={{ width: "100%", borderRadius: 8, boxShadow: theme.shadows[4], "&:hover": { boxShadow: theme.shadows[8] } }}>
          {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.background.paper, "& th": { color: theme.palette.text.primary, fontWeight: "bold", borderBottom: `2px solid ${theme.palette.secondary.main}` } }}>
                <TableCell>Customer</TableCell>
                <TableCell>Firm</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Udhar Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Payment Reference</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale._id} sx={{ "&:hover": { transition: "all 0.3s ease" }, "& td": { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.customer?.name || customers.find((c) => c._id === sale.customer)?.name || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.firm?.name || firms.find((f) => f._id === sale.firm)?.name || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>₹{sale.totalAmount || 0}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>₹{sale.udharAmount || 0}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{sale.paymentMethod || "N/A"}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{sale.paymentRefrence || "N/A"}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.saleType === "stock"
                          ? `Stock: ${stocks.find((s) => s._id === item.salematerialId)?.name || item.salematerialId || "N/A"}`
                          : `Raw Material: ${materials.find((m) => m._id === item.salematerialId)?.name || item.salematerialId || "N/A"}`}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton disabled>
                      <Typography sx={{ color: theme.palette.error.main }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
      <motion.div>
        <h1>{filteredSales.length}</h1>
        {filteredSales.length > 0 && (
          <Typography sx={{ width: 300, margin: "auto", mt: 2 }}>
            <Pagination count={1} page={1} onChange={() => {}} />
          </Typography>
        )}
      </motion.div>

      <Dialog open={openSaleModal} onClose={handleCancel} PaperProps={{ sx: { minWidth: 800 } }}>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.text.white, py: 2, fontSize: "1.5rem" }}>
          Create Sale
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3, display: "flex", alignItems: "flex-start", gap: 1, mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              {selectedCustomer && (
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary }}>
                    Selected: {selectedCustomer.name}
                  </Typography>
                  <Chip
                    label="Clear"
                    size="small"
                    onClick={() => handleCustomerSelect("")}
                    sx={{ bgcolor: theme.palette.error.light, color: theme.palette.text.white, px: 1, fontSize: "0.85rem" }}
                  />
                </Box>
              )}
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  p: 0,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, pt: 1, p:2 }}>
                  <TextField
                    fullWidth
                    placeholder="Search customers..."
                    value={customerSearchQuery}
                    onChange={handleCustomerSearch}
                    onBlur={() => handleSaleFieldBlur("customer")}
                    InputProps={{
                      startAdornment: (
                        <Search sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                      ),
                      sx: { height: 56, fontSize: "0.95rem" },
                    }}
                    error={(touchedSaleFields.customer || saveAttemptedSale) && !newSale.customer}
                    // helperText={(touchedSaleFields.customer || saveAttemptedSale) && !newSale.customer ? "Please select a customer" : ""}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllCustomers(true)}
                    sx={{ height: 56, minWidth: 100, borderRadius: 2, textTransform: "none" }}
                  >
                    Show All
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpenCustomerModal(true)}
                    sx={{ minWidth: 100, height: 56, borderRadius: 2, textTransform: "none",}}
                  >
                  New Customer
                  </Button>
                </Box>
                {(showAllCustomers || customerSearchQuery) && (
                  <Box sx={{ maxHeight: 250, overflowY: "auto", borderTop: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                    {(customerSearchQuery ? filteredCustomers : customers).length > 0 ? (
                      <List dense>
                        {(customerSearchQuery ? filteredCustomers : customers).map((customer) => (
                          <ListItem
                            key={customer._id}
                            disablePadding
                            sx={{
                              bgcolor: newSale.customer === customer._id ? theme.palette.primary.light : "transparent",
                              "&:hover": { bgcolor: theme.palette.action.hover },
                              transition: "background-color 0.2s",
                            }}
                          >
                            <ListItemButton onClick={() => handleCustomerSelect(customer._id)}>
                              <ListItemText
                                primary={customer.name}
                                secondary={
                                  <>
                                    {customer.email} | {firms.find((f) => f._id === customer.firm)?.name || "N/A"}
                                  </>
                                }
                                primaryTypographyProps={{ fontWeight: newSale.customer === customer._id ? "bold" : "normal" }}
                                secondaryTypographyProps={{ color: theme.palette.text.secondary }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography sx={{ p: 1, color: theme.palette.text.secondary }}>
                        No customers found
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
            
          </Box>
          <Select
            name="firm"
            value={newSale.firm || ""}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 3, height: 56 }}
            displayEmpty
            error={saveAttemptedSale && !newSale.firm}
          >
            <MenuItem value="" disabled>Select Firm</MenuItem>
            {firms.map((firm) => (
              <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
            ))}
          </Select>
          {newSale.items.map((item, index) => (
            <Box key={index} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, p: 3, borderRadius: 1, bgcolor: theme.palette.background.paper }}>
              <Select
                name="saleType"
                value={item.saleType || ""}
                onChange={(e) => handleInputChange(e, index)}
                fullWidth
                sx={{ mb: 3, height: 56 }}
                displayEmpty
                error={saveAttemptedSale && !item.saleType}
              >
                <MenuItem value="" disabled>Select Sale Type</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="rawMaterial">Raw Material</MenuItem>
              </Select>
              <Select
                name="salematerialId"
                value={item.salematerialId || ""}
                onChange={(e) => handleInputChange(e, index)}
                fullWidth
                sx={{ mb: 3, height: 56 }}
                displayEmpty
                error={saveAttemptedSale && !item.salematerialId}
              >
                <MenuItem value="" disabled>
                  Select {item.saleType === "stock" ? "Stock" : "Raw Material"}
                </MenuItem>
                {(item.saleType === "stock" ? stocks : materials).map((option) => (
                  <MenuItem key={option._id} value={option._id}>{option.name}</MenuItem>
                ))}
              </Select>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) => handleInputChange(e, index)}
                onBlur={() => handleSaleFieldBlur("quantity", index)}
                fullWidth
                sx={{ mb: 3 }}
                InputProps={{ inputProps: { min: 1 }, sx: { height: 56 } }}
                error={(touchedSaleFields[`items[${index}].quantity`] || saveAttemptedSale) && (!item.quantity || parseFloat(item.quantity) <= 0)}
                helperText={(touchedSaleFields[`items[${index}].quantity`] || saveAttemptedSale) && (!item.quantity ? "Quantity is required" : parseFloat(item.quantity) <= 0 ? "Quantity must be greater than 0" : "")}
              />
              <TextField
                name="amount"
                label="Amount"
                type="number"
                value={item.amount}
                onChange={(e) => handleInputChange(e, index)}
                onBlur={() => handleSaleFieldBlur("amount", index)}
                fullWidth
                sx={{ mb: 3 }}
                InputProps={{ inputProps: { min: 0 }, sx: { height: 56 } }}
                error={(touchedSaleFields[`items[${index}].amount`] || saveAttemptedSale) && (!item.amount || parseFloat(item.amount) <= 0)}
                helperText={(touchedSaleFields[`items[${index}].amount`] || saveAttemptedSale) && (!item.amount ? "Amount is required" : parseFloat(item.amount) <= 0 ? "Amount must be greater than or equal to 0" : "")}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveItem(index)}
                sx={{ mt: 1, textTransform: "none" }}
                disabled={newSale.items.length === 1}
              >
                Remove Item
              </Button>
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddItem} sx={{ mb: 3, textTransform: "none" }}>
            Add Item
          </Button>
          <TextField
            name="totalAmount"
            label="Total Amount"
            type="number"
            value={newSale.totalAmount}
            onChange={handleInputChange}
            onBlur={() => handleSaleFieldBlur("totalAmount")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ inputProps: { min: 0 }, sx: { height: 56 } }}
            error={(touchedSaleFields.totalAmount || saveAttemptedSale) && (!newSale.totalAmount || parseFloat(newSale.totalAmount) <= 0)}
            helperText={(touchedSaleFields.totalAmount || saveAttemptedSale) && (!newSale.totalAmount ? "Total amount is required" : parseFloat(newSale.totalAmount) <= 0 ? "Total amount must be greater than 0" : "")}
          />
          <TextField
            name="UdharAmount"
            label="Udhar Amount"
            type="number"
            value={newSale.UdharAmount}
            onChange={handleInputChange}
            onBlur={() => handleSaleFieldBlur("UdharAmount")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ inputProps: { min: 0 }, sx: { height: 56 } }}
            error={(touchedSaleFields.UdharAmount || saveAttemptedSale) && newSale.UdharAmount && parseFloat(newSale.UdharAmount) < 0}
            helperText={(touchedSaleFields.UdharAmount || saveAttemptedSale) && newSale.UdharAmount && parseFloat(newSale.UdharAmount) < 0 ? "Udhar amount cannot be negative" : ""}
          />
          <Select
            name="paymentMethod"
            value={newSale.paymentMethod}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 3, height: 56 }}
            error={saveAttemptedSale && !newSale.paymentMethod}
          >
            <MenuItem value="" disabled>Select Payment Method</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="bankTransfer">Bank Transfer</MenuItem>
            <MenuItem value="Upi">UPI</MenuItem>
          </Select>
          <TextField
            name="paymentRefrence"
            label="Payment Reference"
            type="text"
            value={newSale.paymentRefrence}
            onChange={handleInputChange}
            onBlur={() => handleSaleFieldBlur("paymentRefrence")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ sx: { height: 56 } }}
          />
          <TextField
            name="paymentAmount"
            label="Payment Amount"
            type="number"
            value={newSale.paymentAmount}
            onChange={handleInputChange}
            onBlur={() => handleSaleFieldBlur("paymentAmount")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ inputProps: { min: 0 }, sx: { height: 56 } }}
            error={(touchedSaleFields.paymentAmount || saveAttemptedSale) && newSale.paymentAmount && parseFloat(newSale.paymentAmount) < 0}
            helperText={(touchedSaleFields.paymentAmount || saveAttemptedSale) && newSale.paymentAmount && parseFloat(newSale.paymentAmount) < 0 ? "Payment amount cannot be negative" : ""}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCancel} sx={{ color: theme.palette.text.primary, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSale}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.white,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              px: 3,
              py: 1,
              textTransform: "none",
            }}
          >
            Save Sale
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCustomerModal} onClose={handleCancelCustomer} PaperProps={{ sx: { minWidth: 500,} }}>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.text.white, py: 2, fontSize: "1.25rem" }}>
          Create New Customer
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {customerLoading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
          <TextField
            name="name"
            label="Customer Name"
            value={newCustomer.name}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("name")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ sx: { height: 56 } }}
            error={(touchedCustomerFields.name || saveAttemptedCustomer) && !newCustomer.name}
            helperText={(touchedCustomerFields.name || saveAttemptedCustomer) && !newCustomer.name ? "Customer name is required" : ""}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={newCustomer.email}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("email")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ sx: { height: 56 } }}
            error={(touchedCustomerFields.email || saveAttemptedCustomer) && !newCustomer.email}
            helperText={(touchedCustomerFields.email || saveAttemptedCustomer) && !newCustomer.email ? "Email is required" : ""}
          />
          <TextField
            name="contact"
            label="Contact"
            value={newCustomer.contact}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("contact")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ sx: { height: 56 } }}
            error={(touchedCustomerFields.contact || saveAttemptedCustomer) && !newCustomer.contact}
            helperText={(touchedCustomerFields.contact || saveAttemptedCustomer) && !newCustomer.contact ? "Contact is required" : ""}
          />
          <Select
            name="firm"
            value={newCustomer.firm || ""}
            onChange={handleCustomerInputChange}
            fullWidth
            sx={{ mb: 3, height: 56 }}
            displayEmpty
            error={saveAttemptedCustomer && !newCustomer.firm}
          >
            <MenuItem value="" disabled>Select Firm</MenuItem>
            {firms.map((firm) => (
              <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
            ))}
          </Select>
          <TextField
            name="address"
            label="Address"
            value={newCustomer.address}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("address")}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ sx: { height: 56 } }}
            error={(touchedCustomerFields.address || saveAttemptedCustomer) && !newCustomer.address}
            helperText={(touchedCustomerFields.address || saveAttemptedCustomer) && !newCustomer.address ? "Address is required" : ""}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCancelCustomer} sx={{ color: theme.palette.text.primary, textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustomer}
            variant="contained"
            disabled={customerLoading || !newCustomer.name || !newCustomer.email || !newCustomer.contact || !newCustomer.firm || !newCustomer.address}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.white,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              px: 3,
              py: 1,
              textTransform: "none",
            }}
          >
            Save Customer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SalesManagement;