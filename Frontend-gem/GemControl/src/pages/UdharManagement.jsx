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

function UdharManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [udharData, setUdharData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSettleModal, setOpenSettleModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [settleAmount, setSettleAmount] = useState("");

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

  // Fetch Udhar data from backend
  useEffect(() => {
    const fetchUdhar = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/udhar"); // Adjust API endpoint
        setUdharData(response.data);
      } catch (err) {
        setError("Error loading Udhar data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUdhar();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSettleUdhar = (customer) => {
    setSelectedCustomer(customer);
    setSettleAmount(customer.outstanding || "");
    setOpenSettleModal(true);
  };

  const handleSettleInputChange = (e) => {
    setSettleAmount(e.target.value);
  };

  const handleSaveSettle = async () => {
    if (!selectedCustomer) return;
    try {
      await axios.post(
        "http://localhost:5000/api/udhar/settle",
        {
          customer: selectedCustomer.customer,
          amount: settleAmount,
          date: new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setUdharData((prev) =>
        prev.map((data) =>
          data.customer === selectedCustomer.customer
            ? {
                ...data,
                outstanding:
                  data.outstanding - settleAmount >= 0
                    ? data.outstanding - settleAmount
                    : 0,
              }
            : data
        )
      );
      setOpenSettleModal(false);
      setSelectedCustomer(null);
      setSettleAmount("");
    } catch (err) {
      console.error("Error settling Udhar:", err);
      setError("Error settling Udhar");
    }
  };

  const handleCancel = () => {
    setOpenSettleModal(false);
    setSelectedCustomer(null);
    setSettleAmount("");
  };

  const filteredUdhar = udharData.filter(
    (data) =>
      data.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.phone.toLowerCase().includes(searchQuery.toLowerCase())
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
          Udhar (Credit) Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleSettleUdhar({ customer: "", outstanding: 0 })} // Default for new settlement
            sx={{
              bgcolor: theme.palette.primary.main, // #C99314
              color: theme.palette.text.primary, // #A76E19
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Settle Udhar
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
              placeholder="Search customers..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
        </Box>
      </Box>

      {/* Udhar Table */}
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
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Total Udhar</TableCell>
                  <TableCell>Outstanding</TableCell>
                  <TableCell>Last Payment</TableCell>
                  <TableCell>Last Sale</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUdhar.map((data, index) => (
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
                      {data.customer}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {data.phone}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {data.totalUdhar || "0"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {data.outstanding || "0"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {data.lastPayment || "-"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {data.lastSale || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSettleUdhar(data)}
                        sx={{
                          color: theme.palette.secondary.main, // #DA9B48
                          borderColor: theme.palette.secondary.main,
                          "&:hover": {
                            bgcolor: "#e9c39b",
                            borderColor: "#c2833a",
                          },
                        }}
                      >
                        Settle
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
          Page 1 of 3
        </Box>
      </motion.div>

      {/* Settle Udhar Modal */}
      <Dialog open={openSettleModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Settle Udhar for {selectedCustomer?.customer || "New Customer"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Settle Amount"
            type="number"
            fullWidth
            value={settleAmount}
            onChange={handleSettleInputChange}
            sx={{ mb: 2 }}
            InputProps={{
              inputProps: {
                min: 0,
                max: selectedCustomer?.outstanding || Infinity,
              },
            }}
          />
          <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            Outstanding: ₹{selectedCustomer?.outstanding || 0}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSettle}
            variant="contained"
            disabled={
              !settleAmount ||
              parseFloat(settleAmount) <= 0 ||
              (selectedCustomer &&
                parseFloat(settleAmount) > selectedCustomer.outstanding)
            }
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              "&:disabled": {
                bgcolor: theme.palette.action.disabledBackground,
              },
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
