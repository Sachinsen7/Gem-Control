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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add, Delete } from "@mui/icons-material";
import api from "../utils/api";
import { toast } from "react-toastify";

// Custom useDebounce hook
function useDebounce(value, wait = 500) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value);
    }, wait);

    return () => clearTimeout(timer);
  }, [value, wait]);

  return debounceValue;
}

function SalesManagement() {
  const theme = useTheme();
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [materials, setMaterials] = useState({ stock: [], rawMaterial: [] });
  const [loading, setLoading] = useState(false);

  // Debounce filterValue for date filter
  const debouncedFilterValue = useDebounce(filterValue, 500);

  const [saleData, setSaleData] = useState({
    customer: "",
    firm: "",
    saleDate: new Date().toISOString().split("T")[0],
    items: [{ saleType: "stock", salematerialId: "", quantity: 1, rate: "", amount: 0 }],
    totalAmount: 0,
    paymentMethod: "cash",
  });

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3, ease: "easeOut" } },
  };

  // Fetch initial data
  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchFirms();
    fetchMaterials();
  }, []);

  // Handle filter when debouncedFilterValue changes
  useEffect(() => {
    if (filterType === "date" && debouncedFilterValue) {
      handleFilter("date", debouncedFilterValue);
    } else if (filterType === "all") {
      fetchSales();
    }
  }, [debouncedFilterValue, filterType]);

  // Fetch all sales
  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllSales");
      setSales(response.data);
    } catch (error) {
      toast.error("Failed to fetch sales");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers, firms, materials
  const fetchCustomers = async () => {
    try {
      const response = await api.get("/getAllCustomers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await api.get("/getAllFirms");
      setFirms(response.data);
    } catch (error) {
      console.error("Error fetching firms:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const stockResponse = await api.get("/getAllStocks");
      const rawMaterialResponse = await api.get("/getAllRawMaterials");
      setMaterials({
        stock: stockResponse.data,
        rawMaterial: rawMaterialResponse.data,
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  // Handle filter
  const handleFilter = async (type, value) => {
    try {
      setLoading(true);
      let response;
      if (type === "customer" && value) {
        response = await api.get("/getSaleByCustomer", { params: { customerId: value } });
      } else if (type === "firm" && value) {
        response = await api.get("/getSaleByFirm", { params: { firmId: value } });
      } else if (type === "date" && value) {
        const formattedDate = new Date(value).toISOString().split("T")[0];
        response = await api.get("/getSaleByDate", { params: { date: formattedDate } });
      } else if (type === "paymentMethod" && value) {
        response = await api.get("/getSaleByPaymentMethod", { params: { paymentMethod: value } });
      } else {
        response = await api.get("/getAllSales");
      }
      setSales(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying filter");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const filteredSales = sales.filter(
    (sale) =>
      sale.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.firm?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some((item) => item.saleType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle create sale, remove sale, and other functions
  const handleCreateSale = () => {
    setOpenCreateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaleData((prev) => {
      const updatedData = { ...prev, [name]: value };
      const totalAmount = updatedData.items.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );
      return { ...updatedData, totalAmount };
    });
  };

  const handleItemChange = (index, field, value) => {
    setSaleData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index][field] = value;
      if (field === "quantity" || field === "rate") {
        updatedItems[index].amount = (parseFloat(updatedItems[index].quantity) || 0) * (parseFloat(updatedItems[index].rate) || 0);
      }
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );
      return { ...prev, items: updatedItems, totalAmount };
    });
  };

  const addItem = () => {
    setSaleData((prev) => ({
      ...prev,
      items: [...prev.items, { saleType: "stock", salematerialId: "", quantity: 1, rate: "", amount: 0 }],
    }));
  };

  const handleSaveSale = async () => {
    try {
      const response = await api.post("/createSale", saleData);
      toast.success(response.data.message);
      setOpenCreateModal(false);
      fetchSales();
      setSaleData({
        customer: "",
        firm: "",
        saleDate: new Date().toISOString().split("T")[0],
        items: [{ saleType: "stock", salematerialId: "", quantity: 1, rate: "", amount: 0 }],
        totalAmount: 0,
        paymentMethod: "cash",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create sale");
      console.error(error);
    }
  };

  const handleRemoveSale = async (saleId) => {
    try {
      const response = await api.get("/removeSale", { params: { saleId } });
      toast.success(response.data.message);
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove sale");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setOpenCreateModal(false);
    setSaleData({
      customer: "",
      firm: "",
      saleDate: new Date().toISOString().split("T")[0],
      items: [{ saleType: "stock", salematerialId: "", quantity: 1, rate: "", amount: 0 }],
      totalAmount: 0,
      paymentMethod: "cash",
    });
  };

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", width: "100%", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Header Section */}
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
            onClick={handleCreateSale}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Create Sale
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
              placeholder="Search sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue("");
              fetchSales();
            }}
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
            <MenuItem value="firm">Firm</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="paymentMethod">Payment Method</MenuItem>
          </Select>
          {filterType === "customer" && (
            <Select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                handleFilter("customer", e.target.value);
              }}
              sx={{ width: 150 }}
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
              onChange={(e) => {
                setFilterValue(e.target.value);
                handleFilter("firm", e.target.value);
              }}
              sx={{ width: 150 }}
            >
              <MenuItem value="">Select Firm</MenuItem>
              {firms.map((firm) => (
                <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
              ))}
            </Select>
          )}
          {filterType === "date" && (
            <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
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
            onClick={() =>{if (filterValue)  handleFilter("date", filterValue)}}
            disabled={!filterValue}

            >Apply</Button>
            </Box>
            
            
          )}
          {filterType === "paymentMethod" && (
            <Select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                handleFilter("paymentMethod", e.target.value);
              }}
              sx={{ width: 150 }}
            >
              <MenuItem value="">Select Method</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="udahr">Udahr</MenuItem>
              <MenuItem value="bankTransfer">Bank Transfer</MenuItem>
              <MenuItem value="Upi">UPI</MenuItem>
            </Select>
          )}
        </Box>
      </Box>

      {/* Sales Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <TableContainer component={Paper} sx={{ width: "100%", borderRadius: 8, boxShadow: theme.shadows[4], "&:hover": { boxShadow: theme.shadows[8] } }}>
          {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.background.paper, "& th": { color: theme.palette.text.primary, fontWeight: "bold", borderBottom: `2px solid ${theme.palette.secondary.main}` } }}>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Firm</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale._id} sx={{ "&:hover": { transition: "all 0.3s ease" }, "& td": { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{sale.customer?.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{sale.firm?.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.items.map((item, idx) => (
                      <div key={idx}>
                        {item.saleType}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>₹{sale.totalAmount}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{sale.paymentMethod}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRemoveSale(sale._id)}>
                      <Delete sx={{ color: theme.palette.error.main }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Create Sale Modal */}
      <Dialog open={openCreateModal} onClose={handleCancel}>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.text.primary }}>
          Create New Sale
        </DialogTitle>
        <DialogContent>
          <Select
            name="customer"
            value={saleData.customer}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="">Select Customer</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer._id} value={customer._id}>{customer.name}</MenuItem>
            ))}
          </Select>
          <Select
            name="firm"
            value={saleData.firm}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="">Select Firm</MenuItem>
            {firms.map((firm) => (
              <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
            ))}
          </Select>
          <TextField
            margin="dense"
            name="saleDate"
            label="Sale Date"
            type="date"
            fullWidth
            value={saleData.saleDate}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          {saleData.items.map((item, index) => (
            <Box key={index} sx={{ mb: 2, display: "flex", gap: 2 }}>
              <Select
                value={item.saleType}
                onChange={(e) => handleItemChange(index, "saleType", e.target.value)}
                sx={{ width: 150 }}
              >
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="rawMaterial">Raw Material</MenuItem>
              </Select>
              <Select
                value={item.salematerialId}
                onChange={(e) => handleItemChange(index, "salematerialId", e.target.value)}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Select Material</MenuItem>
                {materials[item.saleType].map((material) => (
                  <MenuItem key={material._id} value={material._id}>{material.name}</MenuItem>
                ))}
              </Select>
              <TextField
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                sx={{ width: 100 }}
              />
              <TextField
                label="Rate (₹)"
                type="number"
                value={item.rate}
                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                sx={{ width: 150 }}
              />
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addItem}
            sx={{
              color: theme.palette.secondary.main,
              borderColor: theme.palette.secondary.main,
              "&:hover": { bgcolor: "#e9c39b", borderColor: "#c2833a" },
              mb: 2,
            }}
          >
            Add Item
          </Button>
          <Typography sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Total Amount: ₹{saleData.totalAmount.toFixed(2)}
          </Typography>
          <Select
            name="paymentMethod"
            value={saleData.paymentMethod}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="udahr">Udahr</MenuItem>
            <MenuItem value="bankTransfer">Bank Transfer</MenuItem>
            <MenuItem value="Upi">UPI</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ color: theme.palette.text.primary }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSale}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Save Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SalesManagement;