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

  const debouncedFilterValue = useDebounce(filterValue, 500);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Fetch all initial data concurrently
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
        console.log("Initial data fetched:", {
          sales: salesRes.data,
          customers: customersRes.data,
          firms: firmsRes.data,
          materials: materialsRes.data,
          stocks: stocksRes.data,
        });
      } catch (error) {
        console.error("Error fetching initial data:", error);
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
      console.log("Sales fetched:", response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
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
      console.log("Filtered sales:", response.data);
    } catch (error) {
      console.error("Error applying filter:", error);
      toast.error(error.response?.data?.message || "Error applying filter");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleOpenSaleModal = () => setOpenSaleModal(true);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    console.log("Input change:", { name, value, index });
    setNewSale((prev) => {
      if (typeof index === "number") {
        const updatedItems = [...prev.items];
        updatedItems[index] = { ...updatedItems[index], [name]: value };
        return { ...prev, items: updatedItems };
      }
      return { ...prev, [name]: value };
    });
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
    try {
      if (!newSale.customer || !newSale.firm) {
        toast.error("Customer and Firm are required");
        return;
      }
      if (!newSale.items.length || newSale.items.some((item) => !item.salematerialId || !item.quantity || !item.amount)) {
        toast.error("All items must have material, quantity, and amount");
        return;
      }
      if (!newSale.totalAmount || isNaN(newSale.totalAmount) || newSale.totalAmount <= 0) {
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

      console.log("Sending sale data:", saleData);

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
      toast.success("Sale created successfully");
    } catch (error) {
      console.error("Error creating sale:", error.response?.data || error);
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
  };

  const filteredSales = sales.filter(
    (sale) =>
      (sale.customer?.name || customers.find((c) => c._id === sale.customer)?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.firm?.name || firms.find((f) => f._id === sale.firm)?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sale.paymentRefrence || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", width: "100%", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
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
              onChange={(e) => setFilterValue(e.target.value)}
              sx={{ width: 150 }}
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

      <Dialog open={openSaleModal} onClose={handleCancel}>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.text.white }}>
          Create Sale
        </DialogTitle>
        <DialogContent>
          <Select
            name="customer"
            value={newSale.customer || ""}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2, mt: 2 }}
            displayEmpty
            error={newSale.items.length > 0 && !newSale.customer}
          >
            <MenuItem value="" disabled>Select Customer</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer._id} value={customer._id}>{customer.name}</MenuItem>
            ))}
          </Select>
          <Select
            name="firm"
            value={newSale.firm || ""}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            displayEmpty
            error={newSale.items.length > 0 && !newSale.firm}
          >
            <MenuItem value="" disabled>Select Firm</MenuItem>
            {firms.map((firm) => (
              <MenuItem key={firm._id} value={firm._id}>{firm.name}</MenuItem>
            ))}
          </Select>
          {newSale.items.map((item, index) => (
            <Box key={index} sx={{ mb: 2, border: `1px solid ${theme.palette.divider}`, p: 2, borderRadius: 1 }}>
              <Select
                name="saleType"
                value={item.saleType || ""}
                onChange={(e) => handleInputChange(e, index)}
                fullWidth
                sx={{ mb: 2 }}
                displayEmpty
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
                sx={{ mb: 2 }}
                displayEmpty
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
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 1 } }}
                error={item.quantity && item.quantity <= 0}
              />
              <TextField
                name="amount"
                label="Amount"
                type="number"
                value={item.amount}
                onChange={(e) => handleInputChange(e, index)}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{ inputProps: { min: 0 } }}
                error={item.amount && item.amount <= 0}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveItem(index)}
                sx={{ mt: 1 }}
                disabled={newSale.items.length === 1}
              >
                Remove Item
              </Button>
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddItem} sx={{ mb: 2 }}>
            Add Item
          </Button>
          <TextField
            name="totalAmount"
            label="Total Amount"
            type="number"
            value={newSale.totalAmount}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
            error={newSale.totalAmount && newSale.totalAmount <= 0}
          />
          <TextField
            name="UdharAmount"
            label="Udhar Amount"
            type="number"
            value={newSale.UdharAmount}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <Select
            name="paymentMethod"
            value={newSale.paymentMethod}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            error={!newSale.paymentMethod}
          >
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
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            name="paymentAmount"
            label="Payment Amount"
            type="number"
            value={newSale.paymentAmount}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
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
              color: theme.palette.text.white,
              "&:hover": { bgcolor: theme.palette.primary.dark },
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