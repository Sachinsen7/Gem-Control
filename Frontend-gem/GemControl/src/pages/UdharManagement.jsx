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
  Tabs,
  Tab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Delete } from "@mui/icons-material";
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

function UdharManagement() {
  const theme = useTheme();
  const [udharData, setUdharData] = useState([]);
  const [settlementData, setSettlementData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [customers, setCustomers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSettleModal, setOpenSettleModal] = useState(false);
  const [settleUdhar, setSettleUdhar] = useState({ udharId: "", amount: "" });
  const [tabValue, setTabValue] = useState(0); // 0 for Udhars, 1 for Settlements

  const debouncedFilterValue = useDebounce(filterValue, 500);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3, ease: "easeOut" } },
  };

  useEffect(() => {
    fetchUdhar();
    fetchSettlements();
    fetchCustomers();
    fetchFirms();
  }, []);

  useEffect(() => {
    if (filterType === "date" && debouncedFilterValue) {
      handleFilter("date", debouncedFilterValue);
    } else if (filterType === "customer" && filterValue) {
      handleFilter("customer", filterValue);
    } else if (filterType === "firm" && filterValue) {
      handleFilter("firm", filterValue);
    } else if (filterType === "all") {
      if (tabValue === 0) fetchUdhar();
      else fetchSettlements();
    }
  }, [debouncedFilterValue, filterType, filterValue, tabValue]);

  const fetchUdhar = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllUdhar");
      setUdharData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch udhar");
      console.error("Error fetching udhar:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllUdharSetelment");
      setSettlementData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch udhar settlements");
      console.error("Error fetching udhar settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/getAllCustomers");
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await api.get("/getAllFirms");
      setFirms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching firms:", error);
      toast.error("Failed to fetch firms");
    }
  };

  const handleFilter = async (
    type,
    value,
  ) => {
    try {
      setLoading(true);
      let response;
      if (tabValue === 0) {
        // Udhar filters
        if (type === "customer" && value) {
          response = await api.get("/getUdharByCustomer", { params: { customerId: value } });
        } else if (type === "firm" && value) {
          response = await api.get("/getUdharByFirm", { params: { firmId: value } });
        } else if (type === "date" && value) {
          const formattedDate = new Date(value).toISOString().split("T")[0];
          response = await api.get("/getUdharByDate", { params: { date: formattedDate } });
        } else {
          response = await api.get("/getAllUdhar");
        }
        setUdharData(Array.isArray(response.data) ? response.data : []);
      } else {
        // Settlement filters
        if (type === "customer" && value) {
          response = await api.get("/getUdharSetelmentByCustomer", { params: { customerId: value } });
        } else if (type === "date" && value) {
          const formattedDate = new Date(value).toISOString().split("T")[0];
          response = await api.get("/getUdharSetelmentByDate", { params: { date: formattedDate } });
        } else {
          response = await api.get("/getAllUdharSetelment");
        }
        setSettlementData(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying filter");
      console.error("Error applying filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleUdhar = async () => {
    try {
      if (!settleUdhar.udharId || !settleUdhar.amount || isNaN(settleUdhar.amount) || settleUdhar.amount <= 0) {
        toast.error("Valid udhar ID and amount are required");
        return;
      }
      const response = await api.post("/setelUdhar", {
        udharId: settleUdhar.udharId,
        amount: parseFloat(settleUdhar.amount),
      });
      toast.success("Udhar settled successfully");
      setOpenSettleModal(false);
      setSettleUdhar({ udharId: "", amount: "" });
      fetchUdhar(); // Refresh udhar list
      fetchSettlements(); // Refresh settlements
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to settle udhar");
      console.error("Error settling udhar:", error);
    }
  };

  const handleOpenSettleModal = (udharId, amount) => {
    setSettleUdhar({ udharId, amount });
    setOpenSettleModal(true);
  };

  const handleRemoveUdhar = async (udharId) => {
    try {
      toast.error("Remove udhar endpoint not implemented");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove udhar");
      console.error("Error removing udhar:", error);
    }
  };

  const filteredUdhar = udharData.filter(
    (udhar) =>
      (udhar.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (udhar.firm?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (udhar.sale?._id || udhar.sale || "").toString().includes(searchQuery.toLowerCase())
  );

  const filteredSettlements = settlementData.filter(
    (settlement) =>
      (settlement.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (settlement.firm?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (settlement.sale?._id || settlement.sale || "").toString().includes(searchQuery.toLowerCase())
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
          Udhar (Credit) Management
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue("");
              if (tabValue === 0) fetchUdhar();
              else fetchSettlements();
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
            {tabValue === 0 && <MenuItem value="firm">Firm</MenuItem>}
            <MenuItem value="date">Date</MenuItem>
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
          {filterType === "firm" && tabValue === 0 && (
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
        </Box>
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => {
          setTabValue(newValue);
          setFilterType("all");
          setFilterValue("");
          if (newValue === 0) fetchUdhar();
          else fetchSettlements();
        }}
        sx={{ mb: 2 }}
      >
        <Tab label="Udhars" />
        <Tab label="Settlements" />
      </Tabs>

      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <TableContainer component={Paper} sx={{ width: "100%", borderRadius: 8, boxShadow: theme.shadows[4], "&:hover": { boxShadow: theme.shadows[8] } }}>
          {loading && <CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.background.paper, "& th": { color: theme.palette.text.primary, fontWeight: "bold", borderBottom: `2px solid ${theme.palette.secondary.main}` } }}>
                <TableCell>Customer</TableCell>
                <TableCell>Firm</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Sale ID</TableCell>
                {tabValue === 0 && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {tabValue === 0 ? (
                filteredUdhar.map((udhar) => (
                  <TableRow key={udhar._id} sx={{ "&:hover": { transition: "all 0.3s ease" }, "& td": { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.customer?.name || "N/A"}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.firm?.name || "N/A"}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>₹{udhar.amount}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{new Date(udhar.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.sale?._id || udhar.sale || "N/A"}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenSettleModal(udhar._id, udhar.amount)}
                        sx={{ mr: 1 }}
                      >
                        Settle
                      </Button>
                      <IconButton onClick={() => handleRemoveUdhar(udhar._id)} disabled>
                        <Delete sx={{ color: theme.palette.error.main }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                filteredSettlements.map((settlement) => (
                  <TableRow key={settlement._id} sx={{ "&:hover": { transition: "all 0.3s ease" }, "& td": { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{settlement.customer?.name || "N/A"}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{settlement.firm?.name || "N/A"}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>₹{settlement.amount}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{new Date(settlement.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{settlement.sale?._id || settlement.sale || "N/A"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      <Dialog open={openSettleModal} onClose={() => setOpenSettleModal(false)}>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.text.primary }}>
          Settle Udhar
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Settlement Amount"
            type="number"
            value={settleUdhar.amount}
            onChange={(e) => setSettleUdhar({ ...settleUdhar, amount: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
            error={!settleUdhar.amount || settleUdhar.amount <= 0}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettleModal(false)} sx={{ color: theme.palette.text.primary }}>
            Cancel
          </Button>
          <Button
            onClick={handleSettleUdhar}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Settle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UdharManagement;