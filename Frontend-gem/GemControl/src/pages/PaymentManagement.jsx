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
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Delete } from "@mui/icons-material";
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

function PaymentManagement() {
  const theme = useTheme();
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [customers, setCustomers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const debouncedFilterValue = useDebounce(filterValue, 500);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3, ease: "easeOut" } },
  };

  const openModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: "", message: "", type: "info" });
  };

  useEffect(() => {
    fetchPayments();
    fetchCustomers();
    fetchFirms();
  }, []);

  useEffect(() => {
    if (filterType === "date" && debouncedFilterValue) {
      handleFilter("date", debouncedFilterValue);
    } else if (filterType === "all") {
      fetchPayments();
    }
  }, [debouncedFilterValue, filterType]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllPayments");
      setPayments(response.data);
      openModal("Success", "Payments fetched successfully", "success");
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Failed to fetch payments", "error");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/getAllCustomers");
      setCustomers(response.data);
      openModal("Success", "Customers fetched successfully", "success");
    } catch (error) {
      openModal("Error", "Failed to fetch customers", "error");
      console.error("Error fetching customers:", error.message);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await api.get("/getAllFirms");
      setFirms(response.data);
      openModal("Success", "Firms fetched successfully", "success");
    } catch (error) {
      openModal("Error", "Failed to fetch firms", "error");
      console.error("Error fetching firms:", error.message);
    }
  };

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
      openModal("Success", `Filtered by ${type} successfully`, "success");
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Error applying filter", "error");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePayment = async (paymentId) => {
    try {
      setLoading(true);
      await api.delete(`/removePayment/${paymentId}`);
      await fetchPayments();
      openModal("Success", "Payment removed successfully", "success");
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Failed to remove payment", "error");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.paymentRefrence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.firm?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Payments Management
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
          <Paper
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: "200px", md: "300px" },
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconButton sx={{ p: { xs: 0.5, sm: 1 } }}>
              <Search sx={{ color: theme.palette.text.secondary, fontSize: { xs: "1rem", sm: "1.2rem" } }} />
            </IconButton>
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                color: theme.palette.text.primary,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
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
              width: { xs: "100%", sm: "120px" },
              py: 0.5,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            variant="outlined"
          >
            <MenuItem value="all" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>All Filters</MenuItem>
            <MenuItem value="customer" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Customer</MenuItem>
            <MenuItem value="firm" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Firm</MenuItem>
            <MenuItem value="date" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Date</MenuItem>
            <MenuItem value="paymentMethod" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Payment Method</MenuItem>
          </Select>
          {filterType === "customer" && (
            <Select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                handleFilter("customer", e.target.value);
              }}
              sx={{
                width: { xs: "100%", sm: "150px" },
                py: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              <MenuItem value="" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Select Customer</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id} sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  {customer.name}
                </MenuItem>
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
              sx={{
                width: { xs: "100%", sm: "150px" },
                py: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              <MenuItem value="" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Select Firm</MenuItem>
              {firms.map((firm) => (
                <MenuItem key={firm._id} value={firm._id} sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  {firm.name}
                </MenuItem>
              ))}
            </Select>
          )}
          {filterType === "date" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
                alignItems: { xs: "stretch", sm: "center" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: "150px" },
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
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
          {filterType === "paymentMethod" && (
            <Select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                handleFilter("paymentMethod", e.target.value);
              }}
              sx={{
                width: { xs: "100%", sm: "150px" },
                py: 0.5,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              <MenuItem value="" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Select Method</MenuItem>
              <MenuItem value="cash" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Cash</MenuItem>
              <MenuItem value="credit" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Credit</MenuItem>
              <MenuItem value="debit" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Debit</MenuItem>
              <MenuItem value="udharsetelment" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                Udhar Settlement
              </MenuItem>
              <MenuItem value="Upi" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>UPI</MenuItem>
              <MenuItem value="other" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Other</MenuItem>
            </Select>
          )}
        </Box>
      </Box>

      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 2, sm: 3 } }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : filteredPayments.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 3 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            No payments found.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
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
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                      px: { xs: 1, sm: 2 },
                      py: 1,
                    },
                  }}
                >
                  <TableCell>Reference</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Firm</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Payment Type</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Sale Items</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow
                    key={payment._id}
                    sx={{
                      "&:hover": { bgcolor: theme.palette.action.hover, transition: "all 0.3s ease" },
                      "& td": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        fontSize: { xs: "0.75rem", sm: "0.9rem" },
                        px: { xs: 1, sm: 2 },
                        py: 1,
                      },
                    }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary }}>{payment.paymentRefrence}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, display: { xs: "none", sm: "table-cell" } }}>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{payment.customer?.name || "N/A"}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, display: { xs: "none", sm: "table-cell" } }}>
                      {payment.firm?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>₹{payment.amount || 0}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, display: { xs: "none", md: "table-cell" } }}>
                      {payment.paymentType || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, display: { xs: "none", sm: "table-cell" } }}>
                      {payment.sale?.items?.map((item, idx) => (
                        <div key={idx}>
                          {item.saleType === "stock"
                            ? `Stock: ${item.salematerialId?.name || item.salematerialId || "N/A"}`
                            : `Raw Material: ${item.salematerialId?.name || item.salematerialId || "N/A"}`}
                        </div>
                      ))}
                      <div>Total: ₹{payment.sale?.totalAmount || 0}</div>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemovePayment(payment._id)} sx={{ p: { xs: 0.5, sm: 1 } }}>
                        <Delete sx={{ color: theme.palette.error.main, fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {filteredPayments.length > 0 && (
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
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              Total Payments: {filteredPayments.length}
            </Typography>
          </Box>
        )}
      </motion.div>
    </Box>
  );
}

export default PaymentManagement;