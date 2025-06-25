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

function UdharManagement() {
  const theme = useTheme();
  const [udharData, setUdharData] = useState([]);
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
    fetchUdhar();
    fetchCustomers();
    fetchFirms();
  }, []);

  // Handle filter when debouncedFilterValue changes
  useEffect(() => {
    if (filterType === "date" && debouncedFilterValue) {
      handleFilter("date", debouncedFilterValue);
    } else if (filterType === "all") {
      fetchUdhar();
    }
  }, [debouncedFilterValue, filterType]);

  // Fetch all udhar
  const fetchUdhar = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getAllUdhar");
      setUdharData(response.data);
    } catch (error) {
      toast.error("Failed to fetch udhar");
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
        response = await api.get("/getUdharByCustomer", { params: { customerId: value } });
      } else if (type === "firm" && value) {
        response = await api.get("/getUdharByFirm", { params: { firmId: value } });
      } else if (type === "date" && value) {
        const formattedDate = new Date(value).toISOString().split("T")[0];
        response = await api.get("/getUdharByDate", { params: { date: formattedDate } });
      } else {
        response = await api.get("/getAllUdhar");
      }
      setUdharData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying filter");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const filteredUdhar = udharData.filter(
    (udhar) =>
      udhar.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      udhar.firm?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      udhar.sale.toString().includes(searchQuery.toLowerCase())
  );

  // Handle remove udhar (placeholder, requires backend endpoint)
  const handleRemoveUdhar = async (udharId) => {
    try {
      // Replace with actual endpoint when provided
      // const response = await api.get("/removeUdhar", { params: { udharId } });
      toast.error("Remove udhar endpoint not implemented");
      // fetchUdhar();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove udhar");
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
              placeholder="Search udhar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue("");
              fetchUdhar();
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
        </Box>
      </Box>

      {/* Udhar Table */}
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUdhar.map((udhar) => (
                <TableRow key={udhar._id} sx={{ "&:hover": { transition: "all 0.3s ease" }, "& td": { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.customer?.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.firm?.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>₹{udhar.amount}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{new Date(udhar.udharDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.sale}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRemoveUdhar(udhar._id)} disabled>
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

export default UdharManagement;