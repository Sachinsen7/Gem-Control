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
import { Close, Search, Add, Delete, CameraAlt } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { BrowserMultiFormatReader } from '@zxing/library';
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
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // State variables
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

  // Modal states
  const [openSaleModal, setOpenSaleModal] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openCustomerListModal, setOpenCustomerListModal] = useState(false);
  const [openStockListModal, setOpenStockListModal] = useState(false);
  const [openMaterialListModal, setOpenMaterialListModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  // Form states
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

  // UI states
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [touchedSaleFields, setTouchedSaleFields] = useState({});
  const [manualPaymentEdit, setManualPaymentEdit] = useState(false);
  const [manualUdharEdit, setManualUdharEdit] = useState(false);
  const [touchedCustomerFields, setTouchedCustomerFields] = useState({});
  const [saveAttemptedSale, setSaveAttemptedSale] = useState(false);
  const [saveAttemptedCustomer, setSaveAttemptedCustomer] = useState(false);

  // Notification and dialog states
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: "",
    type: "info",
    title: "",
  });

  const [barcodeDialog, setBarcodeDialog] = useState({
    open: false,
    itemIndex: null,
    value: "",
    scanning: false,
    error: "",
  });

  const [invoiceDialog, setInvoiceDialog] = useState({
    open: false,
    sale: null,
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

  // Fetch initial data
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

  // Search and filter handlers
  const handleSearch = useCallback((e) => setSearchQuery(e.target.value), []);

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
      fetchInitialData();
    }
  }, [debouncedFilterValue, filterType, fetchInitialData, handleFilter]);
  // Sale management handlers
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
    setManualPaymentEdit(false);
    setManualUdharEdit(false);
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

          // When material is selected, prefill sensible defaults
          if (name === "salematerialId") {
            const currentItem = updatedItems[index];
            if (!currentItem.quantity) {
              currentItem.quantity = "1";
            }
            if (currentItem.saleType === "stock") {
              const stock = stocks.find((s) => s._id === value);
              if (stock) {
                const baseAmount =
                  typeof stock.totalValue === "number"
                    ? stock.totalValue
                    : (parseFloat(stock.price) || 0) +
                    (parseFloat(stock.makingCharge) || 0);
                currentItem.amount = baseAmount.toString();
              }
            } else {
              const material = materials.find((m) => m._id === value);
              if (material && typeof material.price === "number") {
                currentItem.amount = material.price.toString();
              }
            }
            updatedSale = { ...updatedSale, items: updatedItems };
          }

          // Recalculate total amount from item amounts
          const itemsTotal = updatedSale.items.reduce(
            (sum, it) => sum + (parseFloat(it.amount) || 0),
            0
          );
          updatedSale.totalAmount = itemsTotal ? itemsTotal.toString() : "";
        } else {
          updatedSale = { ...prev, [name]: value };
        }

        // Auto-calculate paymentAmount when totalAmount or udharAmount changes
        if (
          (name === "totalAmount" || name === "udharAmount") &&
          prev.customer &&
          !manualPaymentEdit
        ) {
          const total =
            parseFloat(name === "totalAmount" ? value : prev.totalAmount) || 0;
          const udhar =
            parseFloat(name === "udharAmount" ? value : prev.udharAmount) || 0;
          const payment = Math.max(total - udhar, 0);

          updatedSale = {
            ...updatedSale,
            paymentAmount: payment.toString(),
          };

          if (name === "totalAmount" && value && !manualUdharEdit) {
            const customerUdhar = udharData.find(
              (udhar) => udhar.customer === prev.customer
            );
            const availableUdharAmount = customerUdhar
              ? parseFloat(customerUdhar.amount) || 0
              : 0;
            updatedSale.udharAmount = Math.min(
              availableUdharAmount,
              total
            ).toString();
          }

          if (name === "udharAmount") {
            setManualUdharEdit(true);
          }
        }

        return updatedSale;
      });
      setTouchedSaleFields((prev) => ({ ...prev, [name]: true }));
    },
    [udharData, stocks, materials, manualPaymentEdit, manualUdharEdit]
  );

  // Customer management handlers
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
          udharAmount:
            total && !manualUdharEdit
              ? Math.min(udharAmount, total).toString()
              : prev.udharAmount,
          paymentAmount: payment.toString(),
        };
      });
      setCustomerSearchQuery("");
      setShowAllCustomers(false);
      setTouchedSaleFields((prev) => ({ ...prev, customer: true }));
    },
    [udharData, manualUdharEdit]
  );

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

  // Item management handlers
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

  // Barcode scanning handlers with ZXing library
  const openBarcodeForItem = useCallback((index) => {
    setBarcodeDialog({
      open: true,
      itemIndex: index,
      value: "",
      scanning: false,
      error: "",
    });
  }, []);

  const closeBarcodeDialog = useCallback(() => {
    setBarcodeDialog({
      open: false,
      itemIndex: null,
      value: "",
      scanning: false,
      error: "",
    });
    // Stop any ongoing scanning
    if (codeReader.current) {
      codeReader.current.reset();
    }
  }, []);

  const applyBarcodeSelection = useCallback((code) => {
    setNewSale((prev) => {
      const idx = barcodeDialog.itemIndex;
      if (idx === null || idx === undefined) return prev;
      const updatedItems = [...prev.items];
      const current = { ...updatedItems[idx] };

      // Try match stock first
      const stockMatch = stocks.find((s) => s.stockcode === code);
      const rawMatch = materials.find((m) => m.RawMaterialcode === code);

      if (stockMatch) {
        current.saleType = "stock";
        current.salematerialId = stockMatch._id;
        if (!current.quantity) current.quantity = "1";
        const baseAmount = typeof stockMatch.totalValue === "number"
          ? stockMatch.totalValue
          : (parseFloat(stockMatch.price) || 0) + (parseFloat(stockMatch.makingCharge) || 0);
        current.amount = baseAmount.toString();
      } else if (rawMatch) {
        current.saleType = "rawMaterial";
        current.salematerialId = rawMatch._id;
        if (!current.quantity) current.quantity = "1";
        if (typeof rawMatch.price === "number") current.amount = rawMatch.price.toString();
      }

      updatedItems[idx] = current;
      const itemsTotal = updatedItems.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);

      return {
        ...prev,
        items: updatedItems,
        totalAmount: itemsTotal ? itemsTotal.toString() : "",
      };
    });
  }, [barcodeDialog.itemIndex, stocks, materials]);

  const handleBarcodeConfirm = useCallback(() => {
    if (!barcodeDialog.value) {
      setBarcodeDialog((b) => ({ ...b, error: "Enter a barcode" }));
      return;
    }
    applyBarcodeSelection(barcodeDialog.value);
    closeBarcodeDialog();
  }, [barcodeDialog.value, applyBarcodeSelection, closeBarcodeDialog]);

  const startCameraScan = useCallback(async () => {
    try {
      setBarcodeDialog((b) => ({ ...b, scanning: true, error: "" }));

      // Get available video devices
      const videoInputDevices = await codeReader.current.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error("No camera found");
      }

      // Use the first available camera (or back camera if available)
      const selectedDeviceId = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      )?.deviceId || videoInputDevices[0].deviceId;

      // Start decoding from video device
      const result = await codeReader.current.decodeOnceFromVideoDevice(selectedDeviceId, videoRef.current);

      if (result) {
        setBarcodeDialog((b) => ({ ...b, value: result.text, scanning: false, error: "" }));
        applyBarcodeSelection(result.text);
        closeBarcodeDialog();

        setNotificationDialog({
          open: true,
          message: `Barcode detected: ${result.text}`,
          type: "success",
          title: "Success",
        });
      }
    } catch (error) {
      console.error("Camera scan error:", error);
      let errorMessage = "Unable to scan barcode. ";

      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions and try again.";
      } else if (error.name === "NotFoundError" || error.message.includes("No camera")) {
        errorMessage += "No camera found on this device.";
      } else if (error.name === "NotSupportedError") {
        errorMessage += "Camera not supported on this browser.";
      } else {
        errorMessage += "Please enter the barcode manually.";
      }

      setBarcodeDialog((b) => ({
        ...b,
        scanning: false,
        error: errorMessage
      }));
    }
  }, [applyBarcodeSelection, closeBarcodeDialog]);

  // Sale operations
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
      setInvoiceDialog({ open: true, sale: response.data.sale });

      // Reset form
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
      setManualUdharEdit(false);
      setManualPaymentEdit(false);
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

  // Utility functions
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
    setTouchedSaleFields({});
    setSaveAttemptedSale(false);
    setManualPaymentEdit(false);
    setManualUdharEdit(false);
  }, []);

  const handleSaleFieldBlur = useCallback((fieldName, index = null) => {
    setTouchedSaleFields((prev) => ({
      ...prev,
      [index !== null ? `items[${index}].${fieldName}` : fieldName]: true,
    }));
  }, []);

  const handleNotificationClose = useCallback(() => {
    setNotificationDialog({
      open: false,
      message: "",
      type: "info",
      title: "",
    });
  }, []);

  // Computed values
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
      {/* Header Section */}
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
          </Box>
        </Box>
      </Box>      {
/* Sales Table/List */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
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
              {/* Mobile Card View */}
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
                        Payment Method: {sale.paymentMethod || "N/A"}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 1.5, justifyContent: "space-between" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setInvoiceDialog({ open: true, sale })}
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          textTransform: "none",
                          borderRadius: 2,
                        }}
                      >
                        View Invoice
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete fontSize="small" />}
                        onClick={() => handleDeleteSale(sale._id)}
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
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

              {/* Desktop Table View */}
              <TableContainer
                component={Paper}
                sx={{
                  display: { xs: "none", sm: "block" },
                  borderRadius: 2,
                  boxShadow: theme.shadows[3],
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Firm</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Total Amount</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Payment Method</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow
                        key={sale._id}
                        sx={{
                          "&:hover": { bgcolor: theme.palette.action.hover },
                        }}
                      >
                        <TableCell>{sale.customer?.name || "N/A"}</TableCell>
                        <TableCell>{sale.firm?.name || "N/A"}</TableCell>
                        <TableCell>₹{sale.totalAmount?.toLocaleString() || 0}</TableCell>
                        <TableCell>{sale.paymentMethod || "N/A"}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setInvoiceDialog({ open: true, sale })}
                              sx={{ textTransform: "none", borderRadius: 2 }}
                            >
                              View Invoice
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={<Delete fontSize="small" />}
                              onClick={() => handleDeleteSale(sale._id)}
                              sx={{ textTransform: "none", borderRadius: 2 }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
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
                  />
                </Box>
              )}
            </>
          )}
        </motion.div>
      </Box>
      {/* Create Sale Modal */}
      <Dialog
        open={openSaleModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
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
              color: theme.palette.primary.contrastText,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Customer Selection */}
          <Box sx={{ mb: 3 }}>
            {selectedCustomer && (
              <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Selected: {selectedCustomer.name}
                </Typography>
                <Chip
                  label="Clear"
                  size="small"
                  onClick={() => handleCustomerSelect("")}
                  sx={{
                    bgcolor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    "&:hover": { bgcolor: theme.palette.error.dark }
                  }}
                />
              </Box>
            )}
            <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenCustomerListModal(true)}
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                >
                  {selectedCustomer ? selectedCustomer.name : "Select Customer"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setOpenCustomerModal(true)}
                  sx={{ textTransform: "none" }}
                >
                  New Customer
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Total Amount and Firm */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                name="totalAmount"
                label="Total Amount"
                type="number"
                value={newSale.totalAmount}
                onChange={handleInputChange}
                onBlur={() => handleSaleFieldBlur("totalAmount")}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
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
            <Grid item xs={12}>
              <Select
                name="firm"
                value={newSale.firm || ""}
                onChange={handleInputChange}
                fullWidth
                displayEmpty
                error={saveAttemptedSale && !newSale.firm}
              >
                <MenuItem value="" disabled>
                  Select Firm
                </MenuItem>
                {firms.map((firm) => (
                  <MenuItem key={firm._id} value={firm._id}>
                    {firm.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          {/* Items */}
          {newSale.items.map((item, index) => (
            <Paper
              key={index}
              sx={{
                mb: 2,
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
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
                  >
                    <MenuItem value="" disabled>
                      Select Sale Type
                    </MenuItem>
                    <MenuItem value="stock">Stock</MenuItem>
                    <MenuItem value="rawMaterial">Raw Material</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => openBarcodeForItem(index)}
                      startIcon={<CameraAlt />}
                      sx={{ textTransform: "none", flex: 1 }}
                    >
                      Scan Barcode
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select
                    name="salematerialId"
                    value={item.salematerialId || ""}
                    onChange={(e) => handleInputChange(e, index)}
                    fullWidth
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select {item.saleType === "stock" ? "Stock" : "Raw Material"}
                    </MenuItem>
                    {(item.saleType === "stock" ? stocks : materials).map(
                      (option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.name}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="quantity"
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(e, index)}
                    fullWidth
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="amount"
                    label="Amount"
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleInputChange(e, index)}
                    fullWidth
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    disabled={newSale.items.length === 1}
                    sx={{ textTransform: "none" }}
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
            sx={{ mb: 3, textTransform: "none" }}
          >
            Add Item
          </Button>

          {/* Payment Details */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="udharAmount"
                label="Udhar Amount"
                type="number"
                value={newSale.udharAmount}
                onChange={handleInputChange}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="paymentAmount"
                label="Payment Amount"
                type="number"
                value={newSale.paymentAmount}
                onChange={(e) => {
                  setManualPaymentEdit(true);
                  handleInputChange(e);
                }}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                name="paymentMethod"
                value={newSale.paymentMethod}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="bankTransfer">Bank Transfer</MenuItem>
                <MenuItem value="Upi">UPI</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCancel} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSale}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Save Sale
          </Button>
        </DialogActions>
      </Dialog>      {
/* Barcode Scanner Dialog */}
      <Dialog
        open={barcodeDialog.open}
        onClose={closeBarcodeDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
          Barcode Scanner
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Manual Entry */}
            <TextField
              label="Barcode"
              value={barcodeDialog.value}
              onChange={(e) =>
                setBarcodeDialog((b) => ({
                  ...b,
                  value: e.target.value,
                  error: "",
                }))
              }
              fullWidth
              placeholder="Enter barcode manually or use camera"
            />

            {/* Camera Scanner */}
            <Button
              variant="contained"
              onClick={startCameraScan}
              disabled={barcodeDialog.scanning}
              startIcon={<CameraAlt />}
              sx={{
                textTransform: "none",
                py: 1.5,
                bgcolor: theme.palette.secondary.main,
                "&:hover": { bgcolor: theme.palette.secondary.dark }
              }}
            >
              {barcodeDialog.scanning ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Scanning...
                </Box>
              ) : (
                "Start Camera Scan"
              )}
            </Button>

            {/* Video Element for Camera */}
            <Box
              sx={{
                minHeight: barcodeDialog.scanning ? 300 : 0,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              {barcodeDialog.scanning && (
                <video
                  ref={videoRef}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "4px"
                  }}
                  autoPlay
                  playsInline
                />
              )}
            </Box>

            {/* Error Message */}
            {barcodeDialog.error && (
              <Typography
                color="error"
                sx={{
                  p: 2,
                  bgcolor: theme.palette.error.light + "20",
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.error.light}`
                }}
              >
                {barcodeDialog.error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={closeBarcodeDialog}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBarcodeConfirm}
            disabled={!barcodeDialog.value}
            sx={{ textTransform: "none" }}
          >
            Apply Barcode
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer List Modal */}
      <Dialog
        open={openCustomerListModal}
        onClose={() => setOpenCustomerListModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, maxHeight: "80vh" } }}
      >
        <DialogTitle>Select Customer</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <List>
              {customers.map((customer) => (
                <ListItem key={customer._id} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleCustomerSelect(customer._id);
                      setOpenCustomerListModal(false);
                    }}
                    sx={{
                      bgcolor: newSale.customer === customer._id ? theme.palette.primary.light : "transparent",
                      "&:hover": { bgcolor: theme.palette.action.hover },
                    }}
                  >
                    <ListItemText
                      primary={customer.name}
                      secondary={`${customer.email} | ${customer.firm?.name || firms.find(f => f._id === customer.firm)?.name || "N/A"}`}
                      primaryTypographyProps={{
                        fontWeight: newSale.customer === customer._id ? "bold" : "normal",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomerListModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* New Customer Modal */}
      <Dialog
        open={openCustomerModal}
        onClose={() => setOpenCustomerModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
          Create New Customer
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Customer Name"
                value={newCustomer.name}
                onChange={handleCustomerInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={newCustomer.email}
                onChange={handleCustomerInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="contact"
                label="Contact"
                value={newCustomer.contact}
                onChange={handleCustomerInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                name="firm"
                value={newCustomer.firm || ""}
                onChange={handleCustomerInputChange}
                fullWidth
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Firm
                </MenuItem>
                {firms.map((firm) => (
                  <MenuItem key={firm._id} value={firm._id}>
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
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenCustomerModal(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustomer}
            variant="contained"
            disabled={customerLoading}
            sx={{ textTransform: "none" }}
          >
            {customerLoading ? <CircularProgress size={20} /> : "Save Customer"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Invoice Dialog */}
      <Dialog
        open={invoiceDialog.open}
        onClose={() => setInvoiceDialog({ open: false, sale: null })}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, textAlign: "center" }}>
          Sales Invoice
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {invoiceDialog.sale && (
            <Box>
              {/* Header Information */}
              <Paper sx={{
                p: 2,
                mb: 3,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50]
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Customer: {invoiceDialog.sale.customer?.name ||
                        customers.find((c) => c._id === invoiceDialog.sale.customer)?.name ||
                        "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(invoiceDialog.sale.createdAt || Date.now()).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Firm: {invoiceDialog.sale.firm?.name ||
                        firms.find((f) => f._id === invoiceDialog.sale.firm)?.name ||
                        "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method: {invoiceDialog.sale.paymentMethod || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Items Table */}
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100] }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceDialog.sale.items?.map((it, idx) => {
                      const stock = it.saleType === "stock" ? stocks.find((s) => s._id === it.salematerialId) : null;
                      const material = it.saleType !== "stock" ? materials.find((m) => m._id === it.salematerialId) : null;
                      const name = stock?.name || material?.name || "Unknown";
                      return (
                        <TableRow key={idx} sx={{ "&:nth-of-type(odd)": { bgcolor: theme.palette.action.hover } }}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">{name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Code: {stock?.stockcode || material?.RawMaterialcode || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={it.saleType === "stock" ? "Stock" : "Raw Material"}
                              size="small"
                              color={it.saleType === "stock" ? "primary" : "secondary"}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{it.quantity}</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: "bold" }}>₹{it.amount?.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total Summary */}
              <Paper sx={{ p: 3, bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" fontWeight="bold">
                      Total Amount: ₹{invoiceDialog.sale.totalAmount?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1">
                      Payment: ₹{invoiceDialog.sale.paymentAmount?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1">
                      Udhar: ₹{invoiceDialog.sale.udharAmount?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => window.print()}
            variant="contained"
            sx={{ textTransform: "none", px: 3 }}
          >
            Print Invoice
          </Button>
          <Button
            onClick={() => setInvoiceDialog({ open: false, sale: null })}
            variant="outlined"
            sx={{ textTransform: "none", px: 3 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Modal */}
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