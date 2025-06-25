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
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Delete } from "@mui/icons-material";
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

function PaymentManagement() {
  const theme = useTheme();
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [customers, setCustomers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce filterValue for date filter
  const debouncedFilterValue = useDebounce(filterValue, 500);

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
    fetchPayments();
    fetchCustomers();
    fetchFirms();
  }, []);

  // Handle filter when debouncedFilterValue changes
  useEffect(() => {
    if (filterType === "date" && debouncedFilterValue) {
      handleFilter("date", debouncedFilterValue);
    } else if (filterType === "all") {
      fetchPayments();
    }
  }, [debouncedFilterValue, filterType]);

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllPayments");
      setPayments(response.data);
    } catch (error) {
      toast.error("Failed to fetch payments");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers and firms
  const fetchCustomers = async () => {
    try {
      const response = await api.get("/getAllCustomers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error.message);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await api.get("/getAllFirms");
      setFirms(response.data);
    } catch (error) {
      console.error("Error fetching firms:", error.message);
    }
  };

  // Handle filter
  const handleFilter = async (type, value) => {
    try {
      setLoading(true);
      let response;
      if (type === "customer" && value) {
        response = await api.get("/getPaymentByCustomer", { params: { customerId: value } });
      } else if (type === "firm" && value) {
        response = await api.get("/getPaymentByFirm", { params: { firmId: value } });
      } else if (type === "date" && value) {
        const formattedDate = new Date(value).toISOString().split("T")[0];
        response = await api.get("/getPaymentByDate", { params: { date: formattedDate } });
      } else if (type === "paymentMethod" && value) {
        response = await api.get("/getPaymentByPaymentMethod", { params: { paymentMethod: value } });
      } else {
        response = await api.get("/getAllPayments");
      }
      setPayments(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying filter");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const filteredPayments = payments.filter(
    (payment) =>
      payment.paymentRefrence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.firm?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle remove payment (placeholder, requires backend endpoint)
  const handleRemovePayment = async (paymentId) => {
    try {
      // Replace with actual endpoint when provided
      // const response = await api.get("/removePayment", { params: { paymentId } });
      toast.error("Remove payment endpoint not implemented");
      // fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove payment");
      console.error(error.message);
    }
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
          Payments Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue("");
              fetchPayments();
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
              <MenuItem value="debit">Debit</MenuItem>
              <MenuItem value="udharsetelment">Udhar Settlement</MenuItem>
              <MenuItem value="Upi">UPI</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          )}
        </Box>
      </Box>

      {/* Payments Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <TableContainer component={Paper} sx={{ width: "100%", borderRadius: 8, boxShadow: theme.shadows[4], "&:hover": { boxShadow: theme.shadows[8] } }}>
          {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.background.paper, "& th": { color: theme.palette.text.primary, fontWeight: "bold", borderBottom: `2px solid ${theme.palette.secondary.main}` } }}>
                <TableCell>Reference</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Firm</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Sale Items</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment._id} sx={{ "&:hover": { transition: "all 0.3s ease" }, "& td": { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{payment.paymentRefrence}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{payment.customer?.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{payment.firm?.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>₹{payment.amount}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{payment.paymentType}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {payment.sale?.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.saleType === "stock" ? `Stock: ${item.salematerialId?.name || item.salematerialId}` : `Raw Material: ${item.salematerialId?.name || item.salematerialId}`}
                      </div>
                    ))}
                    <div>Total: ₹{payment.sale?.totalAmount}</div>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRemovePayment(payment._id)} disabled>
                      <Delete sx={{ color: theme.palette.error.main }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </Box>
  );
}

export default PaymentManagement;