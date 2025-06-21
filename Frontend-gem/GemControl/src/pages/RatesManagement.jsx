import {
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputBase,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { MonetizationOn, Grain, Diamond, Update } from "@mui/icons-material";
import api from "../utils/api"; // Import axios instance

function RatesManagement() {
  const theme = useTheme();

  // State for rates
  const [goldRates, setGoldRates] = useState({
    "24K": "",
    "23K": "",
    "22K": "",
    "20K": "",
    "18K": "",
  });
  const [silverRate, setSilverRate] = useState("");
  const [diamondRates, setDiamondRates] = useState({
    "0.5 Carat": "",
    "1 Carat": "",
    "1.5 Carat": "",
    "2 Carat": "",
    "3 Carat": "",
  });

  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("success"); // "success" or "error"
  const [lastUpdateAction, setLastUpdateAction] = useState(null); // For retry

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" },
    }),
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.6, ease: "easeOut" },
    },
  };

  // Fetch today's rates on mount
  useEffect(() => {
    const fetchTodayRates = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/getTodayDailrate");
        const rateData = response.data.rate;

        // Map backend data to frontend state
        setGoldRates({
          "24K": rateData.gold["24K"] || "",
          "23K": rateData.gold["23K"] || "",
          "22K": rateData.gold["22K"] || "",
          "20K": rateData.gold["20K"] || "",
          "18K": rateData.gold["18K"] || "",
        });
        setSilverRate(rateData.silver || "");
        setDiamondRates({
          "0.5 Carat": rateData.daimond["0_5 Carat"] || "",
          "1 Carat": rateData.daimond["1 Carat"] || "",
          "1.5 Carat": rateData.daimond["1_5 Carat"] || "",
          "2 Carat": rateData.daimond["2 Carat"] || "",
          "3 Carat": rateData.daimond["3 Carat"] || "",
        });
      } catch (error) {
        setDialogMessage(
          error.response?.data?.message || "Failed to fetch today's rates"
        );
        setDialogType("error");
        setDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayRates();
  }, []);

  // Handle input changes
  const handleGoldRateChange = (purity) => (e) => {
    const value = e.target.value;
    if (value === "" || (parseFloat(value) >= 0 && !isNaN(value))) {
      setGoldRates({ ...goldRates, [purity]: value });
    }
  };

  const handleSilverRateChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseFloat(value) >= 0 && !isNaN(value))) {
      setSilverRate(value);
    }
  };

  const handleDiamondRateChange = (type) => (e) => {
    const value = e.target.value;
    if (value === "" || (parseFloat(value) >= 0 && !isNaN(value))) {
      setDiamondRates({ ...diamondRates, [type]: value });
    }
  };

  // Handle update submission
  const handleUpdateClick = async () => {
    setIsLoading(true);
    const rateData = {
      date: new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }), // YYYY-MM-DD
      rate: {
        gold: {
          "24K": parseFloat(goldRates["24K"]) || 0,
          "23K": parseFloat(goldRates["23K"]) || 0,
          "22K": parseFloat(goldRates["22K"]) || 0,
          "20K": parseFloat(goldRates["20K"]) || 0,
          "18K": parseFloat(goldRates["18K"]) || 0,
        },
        silver: parseFloat(silverRate) || 0,
        daimond: {
          "0_5 Carat": parseFloat(diamondRates["0.5 Carat"]) || 0,
          "1 Carat": parseFloat(diamondRates["1 Carat"]) || 0,
          "1_5 Carat": parseFloat(diamondRates["1.5 Carat"]) || 0,
          "2 Carat": parseFloat(diamondRates["2 Carat"]) || 0,
          "3 Carat": parseFloat(diamondRates["3 Carat"]) || 0,
        },
      },
    };

    try {
      const response = await api.post("/createDailrate", rateData);
      setDialogMessage(response.data.message);
      setDialogType("success");
      setDialogOpen(true);
    } catch (error) {
      setDialogMessage(
        error.response?.data?.message || "Failed to update rates"
      );
      setDialogType("error");
      setDialogOpen(true);
      setLastUpdateAction(() => handleUpdateClick); // Store for retry
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setLastUpdateAction(null);
  };

  // Handle retry
  const handleRetry = () => {
    setDialogOpen(false);
    if (lastUpdateAction) {
      lastUpdateAction();
    }
  };

  // Current date and time in Asia/Kolkata
  const currentDateTime = new Date()
    .toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$2 $1, $3");

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading rates...
        </Typography>
      </Box>
    );
  }

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
          Rates Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Update />}
          onClick={handleUpdateClick}
          disabled={isLoading}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            "&:hover": { bgcolor: "#b5830f" },
            borderRadius: 2,
          }}
        >
          Update Today's Rate
        </Button>
      </Box>

      {/* Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                height: "100%",
              }}
            >
              <MonetizationOn
                sx={{ fontSize: 40, color: theme.palette.primary.main }}
              />
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.primary, mt: 1, mb: 2 }}
              >
                Gold Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, mb: 2 }}
              >
                Updated: {currentDateTime}
              </Typography>
              {["24K", "23K", "22K", "20K", "18K"].map((purity) => (
                <Box key={purity} sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
                    {purity}
                  </Typography>
                  <InputBase
                    type="number"
                    value={goldRates[purity]}
                    onChange={handleGoldRateChange(purity)}
                    placeholder="Enter rate (/gm)"
                    inputProps={{ min: 0 }}
                    sx={{
                      width: "100%",
                      p: 1,
                      mt: 1,
                      bgcolor: "#fff",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      color: "gray",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    ₹/gm
                  </Typography>
                </Box>
              ))}
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                height: "100%",
              }}
            >
              <Grain sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.primary, mt: 1, mb: 2 }}
              >
                Silver Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, mb: 2 }}
              >
                Updated: {currentDateTime}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                >
                  Silver
                </Typography>
                <InputBase
                  type="number"
                  value={silverRate}
                  onChange={handleSilverRateChange}
                  placeholder="Enter rate (/g)"
                  inputProps={{ min: 0 }}
                  sx={{
                    width: "100%",
                    p: 1,
                    mt: 1,
                    bgcolor: "#fff",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                    color: "gray",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  ₹/g
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                height: "100%",
              }}
            >
              <Diamond
                sx={{ fontSize: 40, color: theme.palette.primary.main }}
              />
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.primary, mt: 1, mb: 2 }}
              >
                Diamond Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, mb: 2 }}
              >
                Updated: {currentDateTime}
              </Typography>
              {["0.5 Carat", "1 Carat", "1.5 Carat", "2 Carat", "3 Carat"].map(
                (type) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                      }}
                    >
                      {type}
                    </Typography>
                    <InputBase
                      type="number"
                      value={diamondRates[type]}
                      onChange={handleDiamondRateChange(type)}
                      placeholder="Enter rate (/pc)"
                      inputProps={{ min: 0 }}
                      sx={{
                        width: "100%",
                        p: 1,
                        mt: 1,
                        bgcolor: "#fff",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 4,
                        color: "gray",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      ₹/pc
                    </Typography>
                  </Box>
                )
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Rates Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
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
                    borderBottom: `2px solid ${theme.palette.secondary.main}`,
                  },
                }}
              >
                <TableCell>Material</TableCell>
                <TableCell>Purity/Type</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Unit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ...Object.keys(goldRates).map((purity) => ({
                  material: "Gold",
                  purity,
                  rate: goldRates[purity] || "N/A",
                  unit: "₹/gm",
                })),
                {
                  material: "Silver",
                  purity: "Silver",
                  rate: silverRate || "N/A",
                  unit: "₹/g",
                },
                ...Object.keys(diamondRates).map((type) => ({
                  material: "Diamond",
                  purity: type,
                  rate: diamondRates[type] || "N/A",
                  unit: "₹/pc",
                })),
              ].map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": { transition: "all 0.3s ease" },
                    "& td": {
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {row.material}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {row.purity}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {row.rate}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {row.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Dialog for Success/Error Messages */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle sx={{ color: dialogType === "success" ? "green" : "red" }}>
          {dialogType === "success" ? "Success" : "Error"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
          {dialogType === "error" && lastUpdateAction && (
            <Button onClick={handleRetry} color="secondary">
              Retry
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RatesManagement;
