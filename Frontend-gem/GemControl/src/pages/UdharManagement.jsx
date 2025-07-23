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
  Card,
  CardContent,
  Collapse,
  IconButton as ExpandIconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Delete, ExpandMore } from "@mui/icons-material";
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
  const [tabValue, setTabValue] = useState(0);
  const [touchedFields, setTouchedFields] = useState({ amount: false });
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [expandedCard, setExpandedCard] = useState(null);

  const debouncedFilterValue = useDebounce(filterValue, 500);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const openModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: "", message: "", type: "info" });
  };

  const handleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
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
      openModal("Success", "Udhars fetched successfully", "success");
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Failed to fetch udhar", "error");
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
      openModal("Success", "Settlements fetched successfully", "success");
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Failed to fetch udhar settlements", "error");
      console.error("Error fetching udhar settlements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/getAllCustomers");
      setCustomers(Array.isArray(response.data) ? response.data : []);
      openModal("Success", "Customers fetched successfully", "success");
    } catch (error) {
      openModal("Error", "Failed to fetch customers", "error");
      console.error("Error fetching customers:", error);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await api.get("/getAllFirms");
      setFirms(Array.isArray(response.data) ? response.data : []);
      openModal("Success", "Firms fetched successfully", "success");
    } catch (error) {
      openModal("Error", "Failed to fetch firms", "error");
      console.error("Error fetching firms:", error);
    }
  };

  const handleFilter = async (type, value) => {
    try {
      setLoading(true);
      let response;
      if (tabValue === 0) {
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
        openModal("Success", `Filtered udhars by ${type} successfully`, "success");
      } else {
        if (type === "customer" && value) {
          response = await api.get("/getUdharSetelmentByCustomer", { params: { customerId: value } });
        } else if (type === "date" && value) {
          const formattedDate = new Date(value).toISOString().split("T")[0];
          response = await api.get("/getUdharSetelmentByDate", { params: { date: formattedDate } });
        } else {
          response = await api.get("/getAllUdharSetelment");
        }
        setSettlementData(Array.isArray(response.data) ? response.data : []);
        openModal("Success", `Filtered settlements by ${type} successfully`, "success");
      }
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Error applying filter", "error");
      console.error("Error applying filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleUdhar = async () => {
    setSaveAttempted(true);
    try {
      if (!settleUdhar.udharId || !settleUdhar.amount || isNaN(settleUdhar.amount) || parseFloat(settleUdhar.amount) <= 0) {
        openModal("Error", "Valid udhar ID and amount are required", "error");
        return;
      }
      const response = await api.post("/setelUdhar", {
        udharId: settleUdhar.udharId,
        amount: parseFloat(settleUdhar.amount),
      });
      openModal("Success", "Udhar settled successfully", "success");
      setOpenSettleModal(false);
      setSettleUdhar({ udharId: "", amount: "" });
      setTouchedFields({ amount: false });
      setSaveAttempted(false);
      fetchUdhar();
      fetchSettlements();
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Failed to settle udhar", "error");
      console.error("Error settling udhar:", error);
    }
  };

  const handleOpenSettleModal = (udharId, amount) => {
    setSettleUdhar({ udharId, amount: amount.toString() });
    setOpenSettleModal(true);
  };

  const handleRemoveUdhar = async (udharId) => {
    try {
      setLoading(true);
      await api.delete(`/removeUdhar/${udharId}`);
      openModal("Success", "Udhar removed successfully", "success");
      fetchUdhar();
    } catch (error) {
      openModal("Error", error.response?.data?.message || "Failed to remove udhar", "error");
      console.error("Error removing udhar:", error);
    } finally {
      setLoading(false);
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
        py: { xs: 2, sm: 3 },
      }}
    >
      <NotificationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
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
            fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.25rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Udhar (Credit) Management
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
              <Search sx={{ color: theme.palette.text.secondary, fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
            </IconButton>
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                color: theme.palette.text.primary,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
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
              width: { xs: "100%", sm: "120px" },
              py: 0.5,
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
            }}
            variant="outlined"
          >
            <MenuItem value="all" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>All Filters</MenuItem>
            <MenuItem value="customer" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>Customer</MenuItem>
            {tabValue === 0 && (
              <MenuItem value="firm" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>Firm</MenuItem>
            )}
            <MenuItem value="date" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>Date</MenuItem>
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
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              <MenuItem value="" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>Select Customer</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id} sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
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
                width: { xs: "100%", sm: "150px" },
                py: 0.5,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              <MenuItem value="" sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>Select Firm</MenuItem>
              {firms.map((firm) => (
                <MenuItem key={firm._id} value={firm._id} sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
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
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                }}
                InputLabelProps={{ shrink: true }}
                label="Select Date"
                InputProps={{ sx: { fontSize: { xs: "0.85rem", sm: "0.9rem" } } }}
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
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  width: { xs: "100%", sm: "auto" },
                  px: { xs: 1, sm: 2 },
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
          setExpandedCard(null);
          if (newValue === 0) fetchUdhar();
          else fetchSettlements();
        }}
        sx={{
          mb: { xs: 1, sm: 2 },
          "& .MuiTab-root": {
            fontSize: { xs: "0.75rem", sm: "0.9rem" },
            textTransform: "none",
            px: { xs: 1, sm: 2 },
            minWidth: { xs: "80px", sm: "100px" },
          },
        }}
        centered
      >
        <Tab label="Udhars" />
        <Tab label="Settlements" />
      </Tabs>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 2, sm: 3 } }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : (tabValue === 0 ? filteredUdhar : filteredSettlements).length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 3 },
              fontSize: { xs: "0.85rem", sm: "1rem" },
            }}
          >
            No {tabValue === 0 ? "udhar" : "settlements"} found.
          </Typography>
        ) : (
          <>
            {/* Desktop View (Table) */}
            <TableContainer
              component={Paper}
              sx={{
                width: "100%",
                borderRadius: 8,
                boxShadow: theme.shadows[4],
                "&:hover": { boxShadow: theme.shadows[8] },
                overflowX: "auto",
                display: { xs: "none", sm: "block" },
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
                        borderBottom: `2px solid ${theme.palette.secondary.main}`,
                        fontSize: { xs: "0.75rem", sm: "0.9rem" },
                        px: { xs: 1, sm: 2 },
                        py: 1,
                      },
                    }}
                  >
                    <TableCell>Customer</TableCell>
                    <TableCell>Firm</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Sale ID</TableCell>
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
                              fontSize: { xs: "0.75rem", sm: "0.9rem" },
                              px: { xs: 1, sm: 2 },
                              py: 1,
                            },
                          }}
                        >
                          <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.customer?.name || "N/A"}</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.firm?.name || "N/A"}</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>₹{udhar.amount || 0}</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {new Date(udhar.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>{udhar.sale?._id || udhar.sale || "N/A"}</TableCell>
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
                            <IconButton onClick={() => handleRemoveUdhar(udhar._id)} sx={{ p: { xs: 0.5, sm: 1 } }}>
                              <Delete sx={{ color: theme.palette.error.main, fontSize: { xs: "1rem", sm: "1.2rem" } }} />
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
                              fontSize: { xs: "0.75rem", sm: "0.9rem" },
                              px: { xs: 1, sm: 2 },
                              py: 1,
                            },
                          }}
                        >
                          <TableCell sx={{ color: theme.palette.text.primary }}>{settlement.customer?.name || "N/A"}</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>{settlement.firm?.name || "N/A"}</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>₹{settlement.amount || 0}</TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {new Date(settlement.paymentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {settlement.sale?._id || settlement.sale || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile View (Cards) */}
            <Box sx={{ display: { xs: "block", sm: "none" }, mt: 2 }}>
              {(tabValue === 0 ? filteredUdhar : filteredSettlements).map((item) => (
                <Card
                  key={item._id}
                  component={motion.div}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  sx={{
                    mb: 2,
                    borderRadius: 4,
                    boxShadow: theme.shadows[3],
                    "&:hover": { boxShadow: theme.shadows[6] },
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, fontWeight: "bold" }}>
                          {item.customer?.name || "N/A"}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" }, color: theme.palette.text.secondary }}>
                          ₹{item.amount || 0}
                        </Typography>
                      </Box>
                      {tabValue === 0 && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenSettleModal(item._id, item.amount)}
                            sx={{
                              fontSize: { xs: "0.7rem", sm: "0.8rem" },
                              py: 0.5,
                              px: 1,
                              textTransform: "none",
                            }}
                          >
                            Settle
                          </Button>
                          <IconButton onClick={() => handleRemoveUdhar(item._id)} sx={{ p: 0.5 }}>
                            <Delete sx={{ color: theme.palette.error.main, fontSize: { xs: "1rem", sm: "1.2rem" } }} />
                          </IconButton>
                          <ExpandIconButton
                            onClick={() => handleExpandCard(item._id)}
                            sx={{
                              transform: expandedCard === item._id ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.3s",
                            }}
                          >
                            <ExpandMore sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
                          </ExpandIconButton>
                        </Box>
                      )}
                      {tabValue === 1 && (
                        <ExpandIconButton
                          onClick={() => handleExpandCard(item._id)}
                          sx={{
                            transform: expandedCard === item._id ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s",
                          }}
                        >
                          <ExpandMore sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
                        </ExpandIconButton>
                      )}
                    </Box>
                    <Collapse in={expandedCard === item._id} timeout="auto">
                      <Box sx={{ mt: 1, pl: 1 }}>
                        <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, color: theme.palette.text.secondary }}>
                          Firm: {item.firm?.name || "N/A"}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, color: theme.palette.text.secondary }}>
                          Date: {new Date(tabValue === 0 ? item.createdAt : item.paymentDate).toLocaleDateString()}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, color: theme.palette.text.secondary }}>
                          Sale ID: {item.sale?._id || item.sale || "N/A"}
                        </Typography>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
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
        maxWidth="xs"
        PaperProps={{ sx: { minWidth: { xs: 280, sm: 360 } } }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "0.9rem", sm: "1.1rem" },
          }}
        >
          Settle Udhar
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
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
              sx: { height: { xs: 40, sm: 48 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } },
            }}
            InputLabelProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
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
            px: { xs: 1.5, sm: 2 },
            pb: { xs: 1.5, sm: 2 },
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
              py: { xs: 0.5, sm: 1 },
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
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
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