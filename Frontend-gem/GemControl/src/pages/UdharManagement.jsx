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
  const [touchedFields, setTouchedFields] = useState({ amount: false });
  const [saveAttempted, setSaveAttempted] = useState(false);

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

  const handleFilter = async (type, value) => {
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
    setSaveAttempted(true);
    try {
      if (!settleUdhar.udharId || !settleUdhar.amount || isNaN(settleUdhar.amount) || parseFloat(settleUdhar.amount) <= 0) {
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
      setTouchedFields({ amount: false });
      setSaveAttempted(false);
      fetchUdhar();
      fetchSettlements();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to settle udhar");
      console.error("Error settling udhar:", error);
    }
  };

  const handleOpenSettleModal = (udharId, amount) => {
    setSettleUdhar({ udharId, amount: amount.toString() });
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

  const handleFieldBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
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
          Udhar (Credit) Management
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
            {tabValue === 0 && (
              <MenuItem value="firm" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                Firm
              </MenuItem>
            )}
            <MenuItem value="date" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Date
            </MenuItem>
          </Select>
          {filterType === "customer" && (
            <Select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                handleFilter("customer", e.target.value);
              }}
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
          {filterType === "firm" && tabValue === 0 && (
            <Select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                handleFilter("firm", e.target.value);
              }}
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
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                width: { xs: "100%", sm: "auto" },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 150 },
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
        sx={{
          mb: { xs: 1, sm: 2 },
          "& .MuiTab-root": {
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
            textTransform: "none",
          },
        }}
      >
        <Tab label="Udhars" />
        <Tab label="Settlements" />
      </Tabs>

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
        ) : (tabValue === 0 ? filteredUdhar : filteredSettlements).length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            No {tabValue === 0 ? "udhar" : "settlements"} found.
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
                  <TableCell>Amount</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Sale ID
                  </TableCell>
                  {tabValue === 0 && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {tabValue === 0
                  ? filteredUdhar.map((udhar) => (
                      <TableRow
                        key={udhar._id}
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
                          {udhar.customer?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            display: { xs: "none", sm: "table-cell" },
                          }}
                        >
                          {udhar.firm?.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>
                          ₹{udhar.amount || 0}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            display: { xs: "none", sm: "table-cell" },
                          }}
                        >
                          {new Date(udhar.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            display: { xs: "none", md: "table-cell" },
                          }}
                        >
                          {udhar.sale?._id || udhar.sale || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenSettleModal(udhar._id, udhar.amount)}
                            sx={{
                              mr: 1,
                              fontSize: { xs: "0.7rem", sm: "0.8rem" },
                              py: { xs: 0.5, sm: 1 },
                              px: { xs: 1, sm: 2 },
                              textTransform: "none",
                            }}
                          >
                            Settle
                          </Button>
                          <IconButton
                            onClick={() => handleRemoveUdhar(udhar._id)}
                            disabled
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <Delete
                              sx={{
                                color: theme.palette.error.main,
                                fontSize: { xs: "1rem", sm: "1.2rem" },
                              }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredSettlements.map((settlement) => (
                      <TableRow
                        key={settlement._id}
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
                          {settlement.customer?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            display: { xs: "none", sm: "table-cell" },
                          }}
                        >
                          {settlement.firm?.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>
                          ₹{settlement.amount || 0}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            display: { xs: "none", sm: "table-cell" },
                          }}
                        >
                          {new Date(settlement.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            display: { xs: "none", md: "table-cell" },
                          }}
                        >
                          {settlement.sale?._id || settlement.sale || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {(tabValue === 0 ? filteredUdhar : filteredSettlements).length > 0 && (
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
              Total {tabValue === 0 ? "Udhars" : "Settlements"}: {(tabValue === 0 ? filteredUdhar : filteredSettlements).length}
            </Typography>
          </Box>
        )}
      </motion.div>

      <Dialog
        open={openSettleModal}
        onClose={() => {
          setOpenSettleModal(false);
          setSettleUdhar({ udharId: "", amount: "" });
          setTouchedFields({ amount: false });
          setSaveAttempted(false);
        }}
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
          Settle Udhar
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 1, sm: 2 } }}>
          <TextField
            label="Settlement Amount"
            type="number"
            value={settleUdhar.amount}
            onChange={(e) => setSettleUdhar({ ...settleUdhar, amount: e.target.value })}
            onBlur={() => handleFieldBlur("amount")}
            fullWidth
            sx={{ mt: { xs: 1, sm: 2 } }}
            InputProps={{
              inputProps: { min: 0 },
              sx: { height: { xs: 48, sm: 56 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            error={(touchedFields.amount || saveAttempted) && (!settleUdhar.amount || parseFloat(settleUdhar.amount) <= 0)}
            helperText={
              (touchedFields.amount || saveAttempted) &&
              (!settleUdhar.amount
                ? "Settlement amount is required"
                : parseFloat(settleUdhar.amount) <= 0
                ? "Amount must be greater than 0"
                : "")
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
            onClick={() => {
              setOpenSettleModal(false);
              setSettleUdhar({ udharId: "", amount: "" });
              setTouchedFields({ amount: false });
              setSaveAttempted(false);
            }}
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
            onClick={handleSettleUdhar}
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
            Settle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UdharManagement;