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
import axios from "axios";

function PaymentManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openRecordModal, setOpenRecordModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    receiptNo: "",
    date: "",
    invoiceNo: "",
    customer: "",
    amount: "",
    method: "Cash",
    reference: "",
    itemName: "",
    quantity: "",
  });

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

  // Fetch payments from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payments"); // Adjust API endpoint
        setPayments(response.data);
      } catch (err) {
        setError("Error loading payments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleRecordPayment = () => {
    setOpenRecordModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMethodChange = (e) => {
    setMethodFilter(e.target.value);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleInputChange = (e) => {
    setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
  };

  const handleSavePayment = async () => {
    try {
      await axios.post("http://localhost:5000/api/payments", newPayment, {
        headers: { "Content-Type": "application/json" },
      });
      setPayments([...payments, { ...newPayment, id: payments.length + 1 }]);
      setOpenRecordModal(false);
      setNewPayment({
        receiptNo: "",
        date: "",
        invoiceNo: "",
        customer: "",
        amount: "",
        method: "Cash",
        reference: "",
        itemName: "",
        quantity: "",
      });
    } catch (err) {
      console.error("Error recording payment:", err);
      setError("Error recording payment");
    }
  };

  const handleCancel = () => {
    setOpenRecordModal(false);
    setNewPayment({
      receiptNo: "",
      date: "",
      invoiceNo: "",
      customer: "",
      amount: "",
      method: "Cash",
      reference: "",
      itemName: "",
      quantity: "",
    });
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((fromDate === "" || new Date(payment.date) >= new Date(fromDate)) &&
        (toDate === "" || new Date(payment.date) <= new Date(toDate)) &&
        (methodFilter === "all" || payment.method === methodFilter))
  );

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        py: 2,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography
          variant="h4"
          sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
        >
          Payments Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleRecordPayment}
            sx={{
              bgcolor: theme.palette.primary.main, // #C99314
              color: theme.palette.text.primary, // #A76E19
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Record Payment
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
              placeholder="Search payments..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={methodFilter}
            onChange={handleMethodChange}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Methods</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            <MenuItem value="Udhar (Credit)">Udhar (Credit)</MenuItem>
          </Select>
          <TextField
            type="text"
            placeholder="mm/dd/yyyy"
            value={fromDate}
            onChange={handleFromDateChange}
            sx={{
              width: 120,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1,
            }}
          />
          <Typography sx={{ color: theme.palette.text.primary }}>to</Typography>
          <TextField
            type="text"
            placeholder="mm/dd/yyyy"
            value={toDate}
            onChange={handleToDateChange}
            sx={{
              width: 120,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1,
            }}
          />
        </Box>
      </Box>

      {/* Payments Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : error ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: 4,
            }}
          >
            {error}
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
              borderRadius: 8,
              boxShadow: theme.shadows[4],
              "&:hover": { boxShadow: theme.shadows[8] },
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
                      borderBottom: `2px solid ${theme.palette.secondary.main}`, // #DA9B48
                    },
                  }}
                >
                  <TableCell>Receipt #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.map((payment, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": {
                        bgcolor: "#f1e8d0", // Light variant of #D9CA9A
                        transition: "all 0.3s ease",
                      },
                      "& td": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                    }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.receiptNo || `REC${index + 1}`}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.date || "06/13/2025"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.invoiceNo || `INV${index + 1}`}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.customer}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.amount || "0"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.method}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.reference || "-"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.itemName}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {payment.quantity || "1"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          color: theme.palette.secondary.main, // #DA9B48
                          borderColor: theme.palette.secondary.main,
                          "&:hover": {
                            bgcolor: "#e9c39b",
                            borderColor: "#c2833a",
                          },
                        }}
                      >
                        Edit
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
          }}
        >
          Page 1 of 6
        </Box>
      </motion.div>

      {/* Record Payment Modal */}
      <Dialog open={openRecordModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Record Payment
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="receiptNo"
            label="Receipt #"
            type="text"
            fullWidth
            value={newPayment.receiptNo}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="text"
            fullWidth
            value={newPayment.date}
            onChange={handleInputChange}
            placeholder="mm/dd/yyyy"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="invoiceNo"
            label="Invoice #"
            type="text"
            fullWidth
            value={newPayment.invoiceNo}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="customer"
            label="Customer"
            type="text"
            fullWidth
            value={newPayment.customer}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="amount"
            label="Amount"
            type="number"
            fullWidth
            value={newPayment.amount}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Select
            name="method"
            value={newPayment.method}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            <MenuItem value="Udhar (Credit)">Udhar (Credit)</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="reference"
            label="Reference"
            type="text"
            fullWidth
            value={newPayment.reference}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="itemName"
            label="Item Name"
            type="text"
            fullWidth
            value={newPayment.itemName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={newPayment.quantity}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePayment}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Save Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PaymentManagement;
