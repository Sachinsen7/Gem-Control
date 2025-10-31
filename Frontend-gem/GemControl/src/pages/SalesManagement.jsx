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
  Card,
  CardContent,
  CardActions,
  Grid,
} from "@mui/material";
import { Close, Search, Add, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../utils/api";
import NotificationModal from "../components/NotificationModal";

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
  const [udharData, setUdharData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSaleModal, setOpenSaleModal] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [newSale, setNewSale] = useState({
    customer: "",
    firm: "",
    items: [
      { saleType: "stock", salematerialId: "", quantity: "", amount: "" },
    ],
    totalAmount: "",
    udharAmount: "",
    paymentMethod: "cash",
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
  const [manualUdharEdit, setManualUdharEdit] = useState(false);
  const [touchedCustomerFields, setTouchedCustomerFields] = useState({});
  const [saveAttemptedSale, setSaveAttemptedSale] = useState(false);
  const [saveAttemptedCustomer, setSaveAttemptedCustomer] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: "",
    type: "info",
    title: "",
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedFilterValue = useDebounce(filterValue, 500);
  const debouncedCustomerSearchQuery = useDebounce(customerSearchQuery, 300);

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

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        salesRes,
        customersRes,
        firmsRes,
        materialsRes,
        stocksRes,
        udharRes,
      ] = await Promise.all([
        api.get("/getAllSales"),
        api.get("/getAllCustomers"),
        api.get("/getAllFirms"),
        api.get("/getAllRawMaterials"),
        api.get("/getAllStocks"),
        api.get("/getAllUdhar"),
      ]);
      setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      setFirms(Array.isArray(firmsRes.data) ? firmsRes.data : []);
      setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
      setStocks(Array.isArray(stocksRes.data) ? stocksRes.data : []);
      setUdharData(Array.isArray(udharRes.data) ? udharRes.data : []);
      setNotificationDialog({
        open: false,
        message: "",
        type: "info",
        title: "",
      });
    } catch (error) {
      console.error("FetchInitialData error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch initial data";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllSales");
      setSales(Array.isArray(response.data) ? response.data : []);
      setNotificationDialog({
        open: false,
        message: "",
        type: "info",
        title: "",
      });
    } catch (error) {
      console.error("FetchSales error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch sales";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilter = useCallback(async (type, value) => {
    try {
      setLoading(true);
      let response;
      if (type === "customer" && value) {
        response = await api.get("/getSaleByCustomer", {
          params: { customerId: value },
        });
      } else if (type === "firm" && value) {
        response = await api.get("/getSaleByFirm", {
          params: { firmId: value },
        });
      } else if (type === "date" && value) {
        const formattedDate = new Date(value).toISOString().slice(0, 10);
        response = await api.get("/getSaleByDate", {
          params: { date: formattedDate },
        });
      } else {
        response = await api.get("/getAllSales");
      }
      setSales(Array.isArray(response.data) ? response.data : []);
      setNotificationDialog({
        open: false,
        message: "",
        type: "info",
        title: "",
      });
    } catch (error) {
      console.error("HandleFilter error:", error);
      const errorMessage =
        error.response?.data?.message || "Error applying filter";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filterType !== "all" && debouncedFilterValue) {
      handleFilter(filterType, debouncedFilterValue);
    } else if (filterType === "all") {
      fetchSales();
    }
  }, [debouncedFilterValue, filterType, fetchSales, handleFilter]);

  const handleDeleteSale = useCallback(async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;
    try {
      setLoading(true);
      await api.get(`/removeSale?saleId=${saleId}`);
      setSales((prev) => prev.filter((sale) => sale._id !== saleId));
      setNotificationDialog({
        open: true,
        message: "Sale deleted successfully!",
        type: "success",
        title: "Success",
      });
    } catch (error) {
      console.error("DeleteSale error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete sale";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e) => setSearchQuery(e.target.value), []);

  const handleOpenSaleModal = useCallback(() => {
    setNewSale({
      customer: "",
      firm: "",
      items: [
        { saleType: "stock", salematerialId: "", quantity: "", amount: "" },
      ],
      totalAmount: "",
      udharAmount: "",
      paymentMethod: "cash",
      paymentAmount: "",
    });
    setTouchedSaleFields({});
    setSaveAttemptedSale(false);
    setOpenSaleModal(true);
  }, []);

  const handleInputChange = useCallback(
    (e, index = null) => {
      const { name, value } = e.target;
      setNewSale((prev) => {
        let updatedSale = { ...prev };
        if (typeof index === "number") {
          const updatedItems = [...prev.items];
          updatedItems[index] = { ...updatedItems[index], [name]: value };
          updatedSale = { ...prev, items: updatedItems };
        } else {
          updatedSale = { ...prev, [name]: value };
        }

        // Auto-calculate paymentAmount when totalAmount or udharAmount changes
        if ((name === "totalAmount" || name === "udharAmount") && prev.customer) {
          const total = parseFloat(name === "totalAmount" ? value : prev.totalAmount) || 0;
          const udhar = parseFloat(name === "udharAmount" ? value : prev.udharAmount) || 0;
          const payment = Math.max(total - udhar, 0);

          updatedSale = {
            ...updatedSale,
            paymentAmount: payment.toString(),
          };

          // Only auto-set udhar amount when total amount changes and user hasn't manually edited udhar
          if (name === "totalAmount" && value && !manualUdharEdit) {
            const customerUdhar = udharData.find(
              (udhar) => udhar.customer === prev.customer
            );
            const availableUdharAmount = customerUdhar
              ? parseFloat(customerUdhar.amount) || 0
              : 0;
            updatedSale.udharAmount = Math.min(availableUdharAmount, total).toString();
          }

          // Track manual udhar editing
          if (name === "udharAmount") {
            setManualUdharEdit(true);
          }
        }

        return updatedSale;
      });
      setTouchedSaleFields((prev) => ({ ...prev, [name]: true }));
    },
    [udharData]
  );

  const handleCustomerSelect = useCallback(
    (customerId) => {
      setNewSale((prev) => {
        const customerUdhar = udharData.find(
          (udhar) => udhar.customer === customerId
        );
        const udharAmount = customerUdhar
          ? parseFloat(customerUdhar.amount) || 0
          : 0;
        const total = parseFloat(prev.totalAmount) || 0;
        const payment = total ? Math.max(total - udharAmount, 0) : "";
        return {
          ...prev,
          customer: customerId,
          udharAmount: total && !manualUdharEdit ? Math.min(udharAmount, total).toString() : prev.udharAmount,
          paymentAmount: payment.toString(),
        };
      });
      setCustomerSearchQuery("");
      setShowAllCustomers(false);
      setTouchedSaleFields((prev) => ({ ...prev, customer: true }));
    },
    [udharData]
  );

  const handleAddItem = useCallback(() => {
    setNewSale((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { saleType: "stock", salematerialId: "", quantity: "", amount: "" },
      ],
    }));
  }, []);

  const handleRemoveItem = useCallback((index) => {
    setNewSale((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSaveSale = useCallback(async () => {
    setSaveAttemptedSale(true);
    try {
      if (!newSale.customer || !newSale.firm) {
        setNotificationDialog({
          open: true,
          message: "Customer and Firm are required",
          type: "error",
          title: "Validation Error",
        });
        return;
      }
      if (
        !newSale.items.length ||
        newSale.items.some(
          (item) =>
            !item.salematerialId ||
            item.quantity === "" ||
            item.amount === "" ||
            parseFloat(item.quantity) <= 0 ||
            parseFloat(item.amount) < 0
        )
      ) {
        setNotificationDialog({
          open: true,
          message:
            "All items must have material, positive quantity, and non-negative amount",
          type: "error",
          title: "Validation Error",
        });
        return;
      }
      if (
        newSale.totalAmount === "" ||
        isNaN(newSale.totalAmount) ||
        parseFloat(newSale.totalAmount) <= 0
      ) {
        setNotificationDialog({
          open: true,
          message: "Valid total amount (greater than 0) is required",
          type: "error",
          title: "Validation Error",
        });
        return;
      }
      if (!newSale.paymentMethod) {
        setNotificationDialog({
          open: true,
          message: "Payment method is required",
          type: "error",
          title: "Validation Error",
        });
        return;
      }
      if (
        newSale.paymentAmount === "" ||
        isNaN(newSale.paymentAmount) ||
        parseFloat(newSale.paymentAmount) < 0
      ) {
        setNotificationDialog({
          open: true,
          message: "Valid payment amount (non-negative) is required",
          type: "error",
          title: "Validation Error",
        });
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
        udharAmount: parseFloat(newSale.udharAmount) || 0,
        paymentMethod: newSale.paymentMethod,
        paymentAmount: parseFloat(newSale.paymentAmount),
      };
      setLoading(true);
      const response = await api.post("/createSale", saleData);
      setSales((prev) => [...prev, response.data.sale]);
      setOpenSaleModal(false);
      setNewSale({
        customer: "",
        firm: "",
        items: [
          { saleType: "stock", salematerialId: "", quantity: "", amount: "" },
        ],
        totalAmount: "",
        udharAmount: "",
        paymentMethod: "cash",
        paymentAmount: "",
      });
      setCustomerSearchQuery("");
      setShowAllCustomers(false);
      setTouchedSaleFields({});
      setManualUdharEdit(false);
      setSaveAttemptedSale(false);
      setNotificationDialog({
        open: true,
        message: "Sale created successfully",
        type: "success",
        title: "Success",
      });
    } catch (error) {
      console.error("SaveSale error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create sale";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  }, [newSale]);

  const handleCancel = useCallback(() => {
    setOpenSaleModal(false);
    setNewSale({
      customer: "",
      firm: "",
      items: [
        { saleType: "stock", salematerialId: "", quantity: "", amount: "" },
      ],
      totalAmount: "",
      udharAmount: "",
      paymentMethod: "cash",
      paymentAmount: "",
    });
    setCustomerSearchQuery("");
    setShowAllCustomers(false);
    setTouchedSaleFields({});
    setSaveAttemptedSale(false);
  }, []);

  const handleCustomerInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
    setTouchedCustomerFields((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSaveCustomer = useCallback(async () => {
    setSaveAttemptedCustomer(true);
    try {
      if (
        !newCustomer.name ||
        !newCustomer.email ||
        !newCustomer.contact ||
        !newCustomer.firm ||
        !newCustomer.address
      ) {
        setNotificationDialog({
          open: true,
          message: "All customer fields are required",
          type: "error",
          title: "Validation Error",
        });
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
      setNewCustomer({
        name: "",
        email: "",
        contact: "",
        firm: "",
        address: "",
      });
      setCustomerSearchQuery("");
      setShowAllCustomers(false);
      setTouchedCustomerFields({});
      setSaveAttemptedCustomer(false);
      setNotificationDialog({
        open: true,
        message: "Customer created successfully",
        type: "success",
        title: "Success",
      });
    } catch (error) {
      console.error("SaveCustomer error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create customer";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
    } finally {
      setCustomerLoading(false);
    }
  }, [newCustomer]);

  const handleCancelCustomer = useCallback(() => {
    setOpenCustomerModal(false);
    setNewCustomer({ name: "", email: "", contact: "", firm: "", address: "" });
    setTouchedCustomerFields({});
    setSaveAttemptedCustomer(false);
  }, []);

  const handleCustomerSearch = useCallback((e) => {
    setCustomerSearchQuery(e.target.value);
    if (e.target.value) {
      setShowAllCustomers(true);
    }
  }, []);

  const handleSaleFieldBlur = useCallback((fieldName, index = null) => {
    setTouchedSaleFields((prev) => ({
      ...prev,
      [index !== null ? `items[${index}].${fieldName}` : fieldName]: true,
    }));
  }, []);

  const handleCustomerFieldBlur = useCallback((fieldName) => {
    setTouchedCustomerFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        customer.name
          .toLowerCase()
          .includes(debouncedCustomerSearchQuery.toLowerCase())
      ),
    [customers, debouncedCustomerSearchQuery]
  );

  const filteredSales = useMemo(
    () =>
      sales.filter(
        (sale) =>
          (
            sale.customer?.name ||
            customers.find((c) => c._id === sale.customer)?.name ||
            ""
          )
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (
            sale.firm?.name ||
            firms.find((f) => f._id === sale.firm)?.name ||
            ""
          )
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    [sales, customers, firms, searchQuery]
  );

  const paginatedSales = useMemo(
    () => filteredSales.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredSales, page]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c._id === newSale.customer),
    [customers, newSale.customer]
  );

  const handleNotificationClose = useCallback(() => {
    setNotificationDialog({
      open: false,
      message: "",
      type: "info",
      title: "",
    });
  }, []);

  return (
    <Box
      sx={{
        maxWidth: "100%",
        margin: "0 auto",
        width: "100%",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          mb: { xs: 2, sm: 3 },
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
            gap: { xs: 1.5, sm: 2 },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: "bold",
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              textAlign: { xs: "center", sm: "left" },
              mb: { xs: 1, sm: 0 },
            }}
          >
            Sales Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1.5, sm: 2 },
              width: { xs: "100%", sm: "auto" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenSaleModal}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(
                  theme.palette.primary.main
                ),
                "&:hover": { bgcolor: theme.palette.primary.dark },
                borderRadius: 2,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                width: { xs: "100%", sm: "auto" },
                textTransform: "none",
                boxShadow: theme.shadows[2],
              }}
            >
              Create Sale
            </Button>
            <Paper
              sx={{
                p: "6px 12px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 240, md: 300 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: theme.shadows[1],
              }}
            >
              <IconButton sx={{ p: { xs: 0.75, sm: 1 } }}>
                <Search sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }} />
              </IconButton>
              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
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
                width: { xs: "100%", sm: 140 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                borderRadius: 2,
                height: { xs: 48, sm: 56 },
                boxShadow: theme.shadows[1],
              }}
            >
              <MenuItem
                value="all"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                All Filters
              </MenuItem>
              <MenuItem
                value="customer"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Customer
              </MenuItem>
              <MenuItem
                value="firm"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Firm
              </MenuItem>
              <MenuItem
                value="date"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Date
              </MenuItem>
            </Select>
            {filterType === "customer" && (
              <Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 160 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  borderRadius: 2,
                  height: { xs: 48, sm: 56 },
                  boxShadow: theme.shadows[1],
                }}
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Select Customer
                </MenuItem>
                {customers.map((customer) => (
                  <MenuItem
                    key={customer._id}
                    value={customer._id}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
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
                  width: { xs: "100%", sm: 160 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  borderRadius: 2,
                  height: { xs: 48, sm: 56 },
                  boxShadow: theme.shadows[1],
                }}
              >
                <MenuItem
                  value=""
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Select Firm
                </MenuItem>
                {firms.map((firm) => (
                  <MenuItem
                    key={firm._id}
                    value={firm._id}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    {firm.name}
                  </MenuItem>
                ))}
              </Select>
            )}
            {filterType === "date" && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <TextField
                  type="date"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  sx={{
                    width: { xs: "100%", sm: 160 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    "& .MuiInputBase-root": { height: { xs: 48, sm: 56 } },
                  }}
                  InputLabelProps={{ shrink: true }}
                  label="Select Date"
                  InputProps={{
                    sx: { fontSize: { xs: "0.875rem", sm: "1rem" } },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    if (filterValue) handleFilter("date", filterValue);
                  }}
                  disabled={!filterValue}
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    width: { xs: "100%", sm: "auto" },
                    textTransform: "none",
                    boxShadow: theme.shadows[1],
                  }}
                >
                  Apply
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <motion.div variants={tableVariants} initial="hidden" animate="visible">
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress
                sx={{
                  color: theme.palette.primary.main,
                  size: { xs: 40, sm: 48 },
                }}
              />
            </Box>
          ) : filteredSales.length === 0 ? (
            <Typography
              sx={{
                color: theme.palette.text.primary,
                textAlign: "center",
                py: { xs: 2, sm: 3 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              No sales found.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: { xs: "block", sm: "none" } }}>
                {paginatedSales.map((sale) => (
                  <Card
                    key={sale._id}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      boxShadow: theme.shadows[3],
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: theme.shadows[6],
                        transform: "translateY(-4px)",
                      },
                      p: { xs: 1, sm: 1.5 },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          fontWeight: "bold",
                          mb: 1,
                        }}
                      >
                        Customer: {sale.customer?.name || "N/A"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          mb: 0.5,
                        }}
                      >
                        Firm: {sale.firm?.name || "N/A"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          mb: 0.5,
                        }}
                      >
                        Total Amount: ₹{sale.totalAmount?.toLocaleString() || 0}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          mb: 0.5,
                        }}
                      >
                        Udhar Amount: ₹{sale.udharAmount?.toLocaleString() || 0}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          mb: 0.5,
                        }}
                      >
                        Payment Method: {sale.paymentMethod || "N/A"}
                      </Typography>
                      <Typography
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Items:
                        {sale.items?.map((item, idx) => (
                          <Box key={idx} sx={{ ml: 1, mt: 0.5 }}>
                            {item.saleType === "stock" ? (
                              (() => {
                                const stock = stocks.find((s) => s._id === item.salematerialId);
                                if (stock) {
                                  return `Stock: ${stock.name || "Unknown"} (Qty: ${item.quantity || 0}, Amount: ₹${item.amount || 0})`;
                                } else {
                                  console.log('Stock not found for ID:', item.salematerialId, 'Available stocks:', stocks.length);
                                  return `Stock: Loading... (Qty: ${item.quantity || 0}, Amount: ₹${item.amount || 0})`;
                                }
                              })()
                            ) : (
                              (() => {
                                const material = materials.find((m) => m._id === item.salematerialId);
                                if (material) {
                                  return `Raw Material: ${material.name || "Unknown"} (Qty: ${item.quantity || 0}, Amount: ₹${item.amount || 0})`;
                                } else {
                                  console.log('Material not found for ID:', item.salematerialId, 'Available materials:', materials.length);
                                  return `Raw Material: Loading... (Qty: ${item.quantity || 0}, Amount: ₹${item.amount || 0})`;
                                }
                              })()
                            )}
                          </Box>
                        ))}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        p: 1.5,
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          px: 2,
                          py: 0.5,
                          textTransform: "none",
                          borderRadius: 2,
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete fontSize="small" />}
                        onClick={() => handleDeleteSale(sale._id)}
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          px: 2,
                          py: 0.5,
                          textTransform: "none",
                          borderRadius: 2,
                        }}
                      >
                        Delete
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
                  boxShadow: theme.shadows[3],
                  "&:hover": { boxShadow: theme.shadows[6] },
                }}
              >
                <Table
                  sx={{
                    minWidth: 650,
                    "& .MuiTableCell-root": {
                      fontSize: { xs: "0.875rem", sm: "1rem" },
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
                          px: { xs: 1.5, sm: 2 },
                          py: 1.5,
                        },
                      }}
                    >
                      <TableCell sx={{ minWidth: 140 }}>Customer</TableCell>
                      <TableCell
                        sx={{
                          minWidth: 120,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        Firm
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Total Amount</TableCell>
                      <TableCell
                        sx={{
                          minWidth: 120,
                          display: { xs: "none", lg: "table-cell" },
                        }}
                      >
                        Udhar Amount
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: 120,
                          display: { xs: "none", lg: "table-cell" },
                        }}
                      >
                        Payment Method
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: 160,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        Items
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow
                        key={sale._id}
                        sx={{
                          "&:hover": { bgcolor: theme.palette.action.hover },
                          "& td": {
                            px: { xs: 1.5, sm: 2 },
                            py: 1.5,
                          },
                        }}
                      >
                        <TableCell>{sale.customer?.name || "N/A"}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          {sale.firm?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          ₹{sale.totalAmount?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", lg: "table-cell" } }}
                        >
                          ₹{sale.udharAmount?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", lg: "table-cell" } }}
                        >
                          {sale.paymentMethod || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          {sale.items?.map((item, idx) => (
                            <Box key={idx} sx={{ mb: 0.5 }}>
                              {(() => {
                                if (item.saleType === "stock") {
                                  const stock = stocks.find((s) => s._id === item.salematerialId);
                                  if (stock) {
                                    return `Stock: ${stock.name} (Qty: ${item.quantity}, ₹${item.amount})`;
                                  } else {
                                    console.log('Stock not found in table for ID:', item.salematerialId);
                                    return `Stock: Loading... (Qty: ${item.quantity}, ₹${item.amount})`;
                                  }
                                } else {
                                  const material = materials.find((m) => m._id === item.salematerialId);
                                  if (material) {
                                    return `Raw Material: ${material.name} (Qty: ${item.quantity}, ₹${item.amount})`;
                                  } else {
                                    console.log('Material not found in table for ID:', item.salematerialId);
                                    return `Raw Material: Loading... (Qty: ${item.quantity}, ₹${item.amount})`;
                                  }
                                }
                              })()}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell
                          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              px: 2,
                              py: 0.5,
                              textTransform: "none",
                              borderRadius: 2,
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => handleDeleteSale(sale._id)}
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              px: 2,
                              py: 0.5,
                              textTransform: "none",
                              borderRadius: 2,
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
              {filteredSales.length > 0 && (
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    Total Sales: {filteredSales.length}
                  </Typography>
                  <Pagination
                    count={Math.ceil(filteredSales.length / itemsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: { xs: "0.875rem", sm: "1rem" },
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
        open={openSaleModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            width: { xs: "90%", sm: "80%", md: 900 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
            boxShadow: theme.shadows[6],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "1rem", sm: "1.25rem" },
            py: 1.5,
            position: "relative",
          }}
        >
          Create Sale
          <IconButton
            onClick={handleCancel}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              p: 0.75,
              color: theme.palette.getContrastText(theme.palette.primary.main),
            }}
          >
            <Close sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Box sx={{ flex: 1 }}>
              {selectedCustomer && (
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 500,
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
                      color: theme.palette.getContrastText(
                        theme.palette.error.light
                      ),
                      px: 1.5,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      borderRadius: 2,
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
                  p: { xs: 1.5, sm: 2 },
                  boxShadow: theme.shadows[2],
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
                            fontSize: { xs: "1.25rem", sm: "1.5rem" },
                          }}
                        />
                      ),
                      sx: {
                        height: { xs: 48, sm: 56 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      },
                    }}
                    error={
                      (touchedSaleFields.customer || saveAttemptedSale) &&
                      !newSale.customer
                    }
                    helperText={
                      (touchedSaleFields.customer || saveAttemptedSale) &&
                        !newSale.customer
                        ? "Please select a customer"
                        : ""
                    }
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllCustomers(true)}
                    sx={{
                      height: { xs: 48, sm: 56 },
                      minWidth: { xs: "100%", sm: 100 },
                      px: { xs: 1, sm: 1.5 },
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
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
                      minWidth: { xs: "100%", sm: 140 },
                      px: { xs: 1, sm: 1.5 },
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    New Customer
                  </Button>
                </Box>
                {(showAllCustomers || customerSearchQuery) && (
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflowY: "auto",
                      borderTop: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      mt: 1.5,
                      bgcolor: theme.palette.background.paper,
                    }}
                  >
                    {(customerSearchQuery ? filteredCustomers : customers)
                      .length > 0 ? (
                      <List dense>
                        {(customerSearchQuery
                          ? filteredCustomers
                          : customers
                        ).map((customer) => (
                          <ListItem
                            key={customer._id}
                            disablePadding
                            sx={{
                              bgcolor:
                                newSale.customer === customer._id
                                  ? theme.palette.primary.light
                                  : "transparent",
                              "&:hover": {
                                bgcolor: theme.palette.action.hover,
                              },
                              transition: "background-color 0.2s",
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleCustomerSelect(customer._id)}
                            >
                              <ListItemText
                                primary={customer.name}
                                secondary={
                                  <>
                                    {customer.email} |{" "}
                                    {firms.find((f) => f._id === customer.firm)
                                      ?.name || "N/A"}
                                  </>
                                }
                                primaryTypographyProps={{
                                  fontWeight:
                                    newSale.customer === customer._id
                                      ? "bold"
                                      : "normal",
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                }}
                                secondaryTypographyProps={{
                                  color: theme.palette.text.secondary,
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography
                        sx={{
                          p: 1.5,
                          color: theme.palette.text.secondary,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          textAlign: "center",
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
          <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
            <Grid item xs={12} sm={6}>
              <Select
                name="firm"
                value={newSale.firm || ""}
                onChange={handleInputChange}
                fullWidth
                displayEmpty
                error={saveAttemptedSale && !newSale.firm}
                sx={{
                  height: { xs: 48, sm: 56 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  borderRadius: 2,
                }}
              >
                <MenuItem
                  value=""
                  disabled
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Select Firm
                </MenuItem>
                {firms.map((firm) => (
                  <MenuItem
                    key={firm._id}
                    value={firm._id}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    {firm.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="totalAmount"
                label="Total Amount"
                type="number"
                value={newSale.totalAmount}
                onChange={handleInputChange}
                onBlur={() => handleSaleFieldBlur("totalAmount")}
                fullWidth
                InputProps={{
                  inputProps: { min: 0 },
                  sx: {
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
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
            </Grid>
          </Grid>
          {newSale.items.map((item, index) => (
            <Paper
              key={index}
              sx={{
                mb: { xs: 2, sm: 3 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Select
                    name="saleType"
                    value={item.saleType || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    fullWidth
                    displayEmpty
                    error={saveAttemptedSale && !item.saleType}
                    sx={{
                      height: { xs: 48, sm: 56 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem
                      value=""
                      disabled
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Select Sale Type
                    </MenuItem>
                    <MenuItem
                      value="stock"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Stock
                    </MenuItem>
                    <MenuItem
                      value="rawMaterial"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Raw Material
                    </MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select
                    name="salematerialId"
                    value={item.salematerialId || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    fullWidth
                    displayEmpty
                    error={saveAttemptedSale && !item.salematerialId}
                    sx={{
                      height: { xs: 48, sm: 56 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem
                      value=""
                      disabled
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Select{" "}
                      {item.saleType === "stock" ? "Stock" : "Raw Material"}
                    </MenuItem>
                    {(item.saleType === "stock" ? stocks : materials).map(
                      (option) => (
                        <MenuItem
                          key={option._id}
                          value={option._id}
                          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                        >
                          {option.name}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="quantity"
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(e, index)}
                    onBlur={() => handleSaleFieldBlur("quantity", index)}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 1 },
                      sx: {
                        height: { xs: 48, sm: 56 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      },
                    }}
                    error={
                      (touchedSaleFields[`items[${index}].quantity`] ||
                        saveAttemptedSale) &&
                      (!item.quantity || parseFloat(item.quantity) <= 0)
                    }
                    helperText={
                      (touchedSaleFields[`items[${index}].quantity`] ||
                        saveAttemptedSale) &&
                      (!item.quantity
                        ? "Quantity is required"
                        : parseFloat(item.quantity) <= 0
                          ? "Quantity must be greater than 0"
                          : "")
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="amount"
                    label="Amount"
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleInputChange(e, index)}
                    onBlur={() => handleSaleFieldBlur("amount", index)}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 0 },
                      sx: {
                        height: { xs: 48, sm: 56 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      },
                    }}
                    error={
                      (touchedSaleFields[`items[${index}].amount`] ||
                        saveAttemptedSale) &&
                      (!item.amount || parseFloat(item.amount) < 0)
                    }
                    helperText={
                      (touchedSaleFields[`items[${index}].amount`] ||
                        saveAttemptedSale) &&
                      (!item.amount
                        ? "Amount is required"
                        : parseFloat(item.amount) < 0
                          ? "Amount must be non-negative"
                          : "")
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    disabled={newSale.items.length === 1}
                    sx={{
                      mt: 1,
                      width: { xs: "100%", sm: "auto" },
                      px: 2,
                      py: 0.5,
                      textTransform: "none",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      borderRadius: 2,
                    }}
                  >
                    Remove Item
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button
            variant="outlined"
            onClick={handleAddItem}
            sx={{
              mb: { xs: 2, sm: 3 },
              width: { xs: "100%", sm: "auto" },
              px: 2,
              py: 0.5,
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              borderRadius: 2,
              boxShadow: theme.shadows[1],
            }}
          >
            Add Item
          </Button>
          <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="udharAmount"
                label="Udhar Amount (Editable)"
                type="number"
                value={newSale.udharAmount}
                onChange={handleInputChange}
                InputProps={{
                  sx: {
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                fullWidth
                error={
                  (touchedSaleFields.udharAmount || saveAttemptedSale) &&
                  newSale.udharAmount &&
                  parseFloat(newSale.udharAmount) < 0
                }
                helperText={
                  (touchedSaleFields.udharAmount || saveAttemptedSale) &&
                    newSale.udharAmount &&
                    parseFloat(newSale.udharAmount) < 0
                    ? "Udhar amount cannot be negative"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="paymentAmount"
                label="Payment Amount"
                type="number"
                value={newSale.paymentAmount}
                InputProps={{
                  readOnly: true,
                  sx: {
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                fullWidth
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
            </Grid>
            <Grid item xs={12}>
              <Select
                name="paymentMethod"
                value={newSale.paymentMethod}
                onChange={handleInputChange}
                fullWidth
                error={saveAttemptedSale && !newSale.paymentMethod}
                sx={{
                  height: { xs: 48, sm: 56 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  borderRadius: 2,
                }}
              >
                <MenuItem
                  value=""
                  disabled
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Select Payment Method
                </MenuItem>
                <MenuItem
                  value="cash"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Cash
                </MenuItem>
                <MenuItem
                  value="credit"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Credit
                </MenuItem>
                <MenuItem
                  value="online"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Online
                </MenuItem>
                <MenuItem
                  value="bankTransfer"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Bank Transfer
                </MenuItem>
                <MenuItem
                  value="Upi"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  UPI
                </MenuItem>
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              width: { xs: "100%", sm: "auto" },
              px: 2,
              py: 0.5,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSale}
            variant="contained"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              width: { xs: "100%", sm: "auto" },
              px: 2,
              py: 0.5,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: theme.shadows[2],
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
        PaperProps={{
          sx: {
            width: { xs: "90%", sm: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
            boxShadow: theme.shadows[6],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "1rem", sm: "1.25rem" },
            py: 1.5,
            position: "relative",
          }}
        >
          Create New Customer
          <IconButton
            onClick={handleCancelCustomer}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              p: 0.75,
              color: theme.palette.getContrastText(theme.palette.primary.main),
            }}
          >
            <Close sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {customerLoading && (
            <CircularProgress
              sx={{
                display: "block",
                margin: "20px auto",
                size: { xs: 40, sm: 48 },
              }}
            />
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Customer Name"
                value={newCustomer.name}
                onChange={handleCustomerInputChange}
                onBlur={() => handleCustomerFieldBlur("name")}
                fullWidth
                InputProps={{
                  sx: {
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                error={
                  (touchedCustomerFields.name || saveAttemptedCustomer) &&
                  !newCustomer.name
                }
                helperText={
                  (touchedCustomerFields.name || saveAttemptedCustomer) &&
                    !newCustomer.name
                    ? "Customer name is required"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={newCustomer.email}
                onChange={handleCustomerInputChange}
                onBlur={() => handleCustomerFieldBlur("email")}
                fullWidth
                InputProps={{
                  sx: {
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                error={
                  (touchedCustomerFields.email || saveAttemptedCustomer) &&
                  !newCustomer.email
                }
                helperText={
                  (touchedCustomerFields.email || saveAttemptedCustomer) &&
                    !newCustomer.email
                    ? "Email is required"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="contact"
                label="Contact"
                value={newCustomer.contact}
                onChange={handleCustomerInputChange}
                onBlur={() => handleCustomerFieldBlur("contact")}
                fullWidth
                InputProps={{
                  sx: {
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                error={
                  (touchedCustomerFields.contact || saveAttemptedCustomer) &&
                  !newCustomer.contact
                }
                helperText={
                  (touchedCustomerFields.contact || saveAttemptedCustomer) &&
                    !newCustomer.contact
                    ? "Contact is required"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                name="firm"
                value={newCustomer.firm || ""}
                onChange={handleCustomerInputChange}
                fullWidth
                displayEmpty
                error={saveAttemptedCustomer && !newCustomer.firm}
                sx={{
                  height: { xs: 48, sm: 56 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  borderRadius: 2,
                }}
              >
                <MenuItem
                  value=""
                  disabled
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Select Firm
                </MenuItem>
                {firms.map((firm) => (
                  <MenuItem
                    key={firm._id}
                    value={firm._id}
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    {firm.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={newCustomer.address}
                onChange={handleCustomerInputChange}
                onBlur={() => handleCustomerFieldBlur("address")}
                fullWidth
                InputProps={{
                  sx: {
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  },
                }}
                error={
                  (touchedCustomerFields.address || saveAttemptedCustomer) &&
                  !newCustomer.address
                }
                helperText={
                  (touchedCustomerFields.address || saveAttemptedCustomer) &&
                    !newCustomer.address
                    ? "Address is required"
                    : ""
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Button
            onClick={handleCancelCustomer}
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              width: { xs: "100%", sm: "auto" },
              px: 2,
              py: 0.5,
              borderRadius: 2,
              textTransform: "none",
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
              fontSize: { xs: "0.875rem", sm: "1rem" },
              width: { xs: "100%", sm: "auto" },
              px: 2,
              py: 0.5,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: theme.shadows[2],
            }}
          >
            Save Customer
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationModal
        isOpen={notificationDialog.open}
        onClose={handleNotificationClose}
        message={notificationDialog.message}
        type={notificationDialog.type}
        title={notificationDialog.title}
      />
    </Box>
  );
}

export default SalesManagement;
