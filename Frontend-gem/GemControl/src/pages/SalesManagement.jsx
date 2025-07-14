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
  InputBase,
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
    <Box
      sx={{
        maxWidth: "100%",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 },
      }}
    >
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
          Sales Management
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
            onClick={handleOpenSaleModal}
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
          >
            Create Sale
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
              width: { xs: "100%", sm: 120 },
              py: 0.5,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            variant="outlined"
          >
            <MenuItem value="all" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              All Filters
            </MenuItem>
            <MenuItem value="customer" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Customer
            </MenuItem>
            <MenuItem value="firm" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Firm
            </MenuItem>
            <MenuItem value="date" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Date
            </MenuItem>
          </Select>
          {filterType === "customer" && (
            <Select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 150 },
                py: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              <MenuItem value="" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                Select Customer
              </MenuItem>
              {customers.map((customer) => (
                <MenuItem
                  key={customer._id}
                  value={customer._id}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          )}
          {filterType === "firm" && (
            <Select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 150 },
                py: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              <MenuItem value="" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                Select Firm
              </MenuItem>
              {firms.map((firm) => (
                <MenuItem
                  key={firm._id}
                  value={firm._id}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                >
                  {firm.name}
                </MenuItem>
              ))}
            </Select>
          )}
          {filterType === "date" && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: { xs: "100%", sm: "auto" } }}>
              <TextField
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                sx={{ width: { xs: "100%", sm: 150 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                InputLabelProps={{ shrink: true }}
                label="Select Date"
                InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (filterValue) handleFilter("date", filterValue);
                }}
                disabled={!filterValue}
                sx={{
                  py: 1,
                  textTransform: "none",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Apply
              </Button>
            </Box>
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
        ) : filteredSales.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            No sales found.
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
                  <TableCell>Customer</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Firm
                  </TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Udhar Amount
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Payment Method
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    Payment Reference
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Items
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow
                    key={sale._id}
                    sx={{
                      "&:hover": { bgcolor: theme.palette.action.hover, transition: "all 0.3s ease" },
                      "& td": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        px: { xs: 1, sm: 2 },
                      },
                    }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {sale.customer?.name || customers.find((c) => c._id === sale.customer)?.name || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {sale.firm?.name || firms.find((f) => f._id === sale.firm)?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      ₹{sale.totalAmount || 0}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      ₹{sale.udharAmount || 0}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {sale.paymentMethod || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", lg: "table-cell" },
                      }}
                    >
                      {sale.paymentRefrence || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
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
        )}
        {filteredSales.length > 0 && (
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
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Total Sales: {filteredSales.length}
            </Typography>
            <Pagination
              count={1}
              page={1}
              onChange={() => {}}
              sx={{ "& .MuiPaginationItem-root": { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
            />
          </Box>
        )}
      </motion.div>

      <Dialog
        open={openSaleModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { minWidth: { xs: 300, sm: 500, md: 800 } } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            py: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Create Sale
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 3 } }}>
          <Box sx={{ mb: { xs: 2, sm: 3 }, mt: { xs: 1, sm: 2 } }}>
            <Box sx={{ flex: 1 }}>
              {selectedCustomer && (
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    Selected: {selectedCustomer.name}
                  </Typography>
                  <Chip
                    label="Clear"
                    size="small"
                    onClick={() => handleCustomerSelect("")}
                    sx={{
                      bgcolor: theme.palette.error.light,
                      color: theme.palette.text.primary,
                      px: 1,
                      fontSize: { xs: "0.7rem", sm: "0.85rem" },
                    }}
                  />
                </Box>
              )}
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  p: { xs: 1, sm: 2 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search customers..."
                    value={customerSearchQuery}
                    onChange={handleCustomerSearch}
                    onBlur={() => handleSaleFieldBlur("customer")}
                    InputProps={{
                      startAdornment: (
                        <Search
                          sx={{
                            color: theme.palette.text.secondary,
                            mr: 1,
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                          }}
                        />
                      ),
                      sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.95rem" } },
                    }}
                    error={(touchedSaleFields.customer || saveAttemptedSale) && !newSale.customer}
                    helperText={
                      (touchedSaleFields.customer || saveAttemptedSale) && !newSale.customer
                        ? "Please select a customer"
                        : ""
                    }
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllCustomers(true)}
                    sx={{
                      height: { xs: 48, sm: 56 },
                      minWidth: { xs: "100%", sm: 100 },
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    }}
                  >
                    Show All
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpenCustomerModal(true)}
                    sx={{
                      height: { xs: 48, sm: 56 },
                      minWidth: { xs: "100%", sm: 100 },
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    }}
                  >
                    New Customer
                  </Button>
                </Box>
                {(showAllCustomers || customerSearchQuery) && (
                  <Box
                    sx={{
                      maxHeight: 250,
                      overflowY: "auto",
                      borderTop: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      mt: 1,
                    }}
                  >
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
                                primaryTypographyProps={{
                                  fontWeight: newSale.customer === customer._id ? "bold" : "normal",
                                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                }}
                                secondaryTypographyProps={{
                                  color: theme.palette.text.secondary,
                                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography
                        sx={{
                          p: 1,
                          color: theme.palette.text.secondary,
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        }}
                      >
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
            sx={{ mb: { xs: 2, sm: 3 }, height: { xs: 48, sm: 56 } }}
            displayEmpty
            error={saveAttemptedSale && !newSale.firm}
          >
            <MenuItem value="" disabled sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Select Firm
            </MenuItem>
            {firms.map((firm) => (
              <MenuItem
                key={firm._id}
                value={firm._id}
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                {firm.name}
              </MenuItem>
            ))}
          </Select>
          {newSale.items.map((item, index) => (
            <Box
              key={index}
              sx={{
                mb: { xs: 2, sm: 3 },
                border: `1px solid ${theme.palette.divider}`,
                p: { xs: 2, sm: 3 },
                borderRadius: 1,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Select
                name="saleType"
                value={item.saleType || ""}
                onChange={(e) => handleInputChange(e, index)}
                fullWidth
                sx={{ mb: { xs: 2, sm: 3 }, height: { xs: 48, sm: 56 } }}
                displayEmpty
                error={saveAttemptedSale && !item.saleType}
              >
                <MenuItem value="" disabled sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  Select Sale Type
                </MenuItem>
                <MenuItem value="stock" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  Stock
                </MenuItem>
                <MenuItem value="rawMaterial" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  Raw Material
                </MenuItem>
              </Select>
              <Select
                name="salematerialId"
                value={item.salematerialId || ""}
                onChange={(e) => handleInputChange(e, index)}
                fullWidth
                sx={{ mb: { xs: 2, sm: 3 }, height: { xs: 48, sm: 56 } }}
                displayEmpty
                error={saveAttemptedSale && !item.salematerialId}
              >
                <MenuItem value="" disabled sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  Select {item.saleType === "stock" ? "Stock" : "Raw Material"}
                </MenuItem>
                {(item.saleType === "stock" ? stocks : materials).map((option) => (
                  <MenuItem
                    key={option._id}
                    value={option._id}
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  >
                    {option.name}
                  </MenuItem>
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
                sx={{ mb: { xs: 2, sm: 3 } }}
                InputProps={{
                  inputProps: { min: 1 },
                  sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedSaleFields[`items[${index}].quantity`] || saveAttemptedSale) &&
                  (!item.quantity || parseFloat(item.quantity) <= 0)
                }
                helperText={
                  (touchedSaleFields[`items[${index}].quantity`] || saveAttemptedSale) &&
                  (!item.quantity
                    ? "Quantity is required"
                    : parseFloat(item.quantity) <= 0
                    ? "Quantity must be greater than 0"
                    : "")
                }
              />
              <TextField
                name="amount"
                label="Amount"
                type="number"
                value={item.amount}
                onChange={(e) => handleInputChange(e, index)}
                onBlur={() => handleSaleFieldBlur("amount", index)}
                fullWidth
                sx={{ mb: { xs: 2, sm: 3 } }}
                InputProps={{
                  inputProps: { min: 0 },
                  sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                }}
                error={
                  (touchedSaleFields[`items[${index}].amount`] || saveAttemptedSale) &&
                  (!item.amount || parseFloat(item.amount) <= 0)
                }
                helperText={
                  (touchedSaleFields[`items[${index}].amount`] || saveAttemptedSale) &&
                  (!item.amount
                    ? "Amount is required"
                    : parseFloat(item.amount) <= 0
                    ? "Amount must be greater than or equal to 0"
                    : "")
                }
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveItem(index)}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
                disabled={newSale.items.length === 1}
              >
                Remove Item
              </Button>
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={handleAddItem}
            sx={{
              mb: { xs: 2, sm: 3 },
              textTransform: "none",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
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
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={
              (touchedSaleFields.totalAmount || saveAttemptedSale) &&
              (!newSale.totalAmount || parseFloat(newSale.totalAmount) <= 0)
            }
            helperText={
              (touchedSaleFields.totalAmount || saveAttemptedSale) &&
              (!newSale.totalAmount
                ? "Total amount is required"
                : parseFloat(newSale.totalAmount) <= 0
                ? "Total amount must be greater than 0"
                : "")
            }
          />
          <TextField
            name="UdharAmount"
            label="Udhar Amount"
            type="number"
            value={newSale.UdharAmount}
            onChange={handleInputChange}
            onBlur={() => handleSaleFieldBlur("UdharAmount")}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={
              (touchedSaleFields.UdharAmount || saveAttemptedSale) &&
              newSale.UdharAmount &&
              parseFloat(newSale.UdharAmount) < 0
            }
            helperText={
              (touchedSaleFields.UdharAmount || saveAttemptedSale) &&
              newSale.UdharAmount &&
              parseFloat(newSale.UdharAmount) < 0
                ? "Udhar amount cannot be negative"
                : ""
            }
          />
          <Select
            name="paymentMethod"
            value={newSale.paymentMethod}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 }, height: { xs: 48, sm: 56 } }}
            error={saveAttemptedSale && !newSale.paymentMethod}
          >
            <MenuItem value="" disabled sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Select Payment Method
            </MenuItem>
            <MenuItem value="cash" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Cash
            </MenuItem>
            <MenuItem value="credit" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Credit
            </MenuItem>
            <MenuItem value="online" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Online
            </MenuItem>
            <MenuItem value="bankTransfer" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Bank Transfer
            </MenuItem>
            <MenuItem value="Upi" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              UPI
            </MenuItem>
          </Select>
          <TextField
            name="paymentRefrence"
            label="Payment Reference"
            type="text"
            value={newSale.paymentRefrence}
            onChange={handleInputChange}
            onBlur={() => handleSaleFieldBlur("paymentRefrence")}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
          />
          <TextField
            name="paymentAmount"
            label="Payment Amount"
            type="number"
            value={newSale.paymentAmount}
            onChange={handleInputChange}
            onBlur={() => handleSaleFieldBlur("paymentAmount")}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={
              (touchedSaleFields.paymentAmount || saveAttemptedSale) &&
              newSale.paymentAmount &&
              parseFloat(newSale.paymentAmount) < 0
            }
            helperText={
              (touchedSaleFields.paymentAmount || saveAttemptedSale) &&
              newSale.paymentAmount &&
              parseFloat(newSale.paymentAmount) < 0
                ? "Payment amount cannot be negative"
                : ""
            }
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              color: theme.palette.text.primary,
              textTransform: "none",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSale}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              px: { xs: 2, sm: 3 },
              py: 1,
              textTransform: "none",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Save Sale
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCustomerModal}
        onClose={handleCancelCustomer}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { minWidth: { xs: 300, sm: 500 } } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            py: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Create New Customer
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 3 } }}>
          {customerLoading && (
            <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
          )}
          <TextField
            name="name"
            label="Customer Name"
            value={newCustomer.name}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("name")}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={(touchedCustomerFields.name || saveAttemptedCustomer) && !newCustomer.name}
            helperText={
              (touchedCustomerFields.name || saveAttemptedCustomer) && !newCustomer.name
                ? "Customer name is required"
                : ""
            }
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={newCustomer.email}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("email")}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={(touchedCustomerFields.email || saveAttemptedCustomer) && !newCustomer.email}
            helperText={
              (touchedCustomerFields.email || saveAttemptedCustomer) && !newCustomer.email
                ? "Email is required"
                : ""
            }
          />
          <TextField
            name="contact"
            label="Contact"
            value={newCustomer.contact}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("contact")}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={(touchedCustomerFields.contact || saveAttemptedCustomer) && !newCustomer.contact}
            helperText={
              (touchedCustomerFields.contact || saveAttemptedCustomer) && !newCustomer.contact
                ? "Contact is required"
                : ""
            }
          />
          <Select
            name="firm"
            value={newCustomer.firm || ""}
            onChange={handleCustomerInputChange}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 }, height: { xs: 48, sm: 56 } }}
            displayEmpty
            error={saveAttemptedCustomer && !newCustomer.firm}
          >
            <MenuItem value="" disabled sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Select Firm
            </MenuItem>
            {firms.map((firm) => (
              <MenuItem
                key={firm._id}
                value={firm._id}
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                {firm.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            name="address"
            label="Address"
            value={newCustomer.address}
            onChange={handleCustomerInputChange}
            onBlur={() => handleCustomerFieldBlur("address")}
            fullWidth
            sx={{ mb: { xs: 2, sm: 3 } }}
            InputProps={{
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={(touchedCustomerFields.address || saveAttemptedCustomer) && !newCustomer.address}
            helperText={
              (touchedCustomerFields.address || saveAttemptedCustomer) && !newCustomer.address
                ? "Address is required"
                : ""
            }
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCancelCustomer}
            sx={{
              color: theme.palette.text.primary,
              textTransform: "none",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustomer}
            variant="contained"
            disabled={
              customerLoading ||
              !newCustomer.name ||
              !newCustomer.email ||
              !newCustomer.contact ||
              !newCustomer.firm ||
              !newCustomer.address
            }
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              px: { xs: 2, sm: 3 },
              py: 1,
              textTransform: "none",
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
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