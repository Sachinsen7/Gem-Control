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
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import {
  MonetizationOn,
  Grain,
  Diamond,
  Update,
  Add,
} from "@mui/icons-material";
import api from "../utils/api";

function RatesManagement() {
  const theme = useTheme();

  // State for latest rates
  const [goldRates, setGoldRates] = useState({
    "24K": "N/A",
    "23K": "N/A",
    "22K": "N/A",
    "20K": "N/A",
    "18K": "N/A",
  });
  const [silverRate, setSilverRate] = useState("N/A");
  const [diamondRates, setDiamondRates] = useState({
    "0.5 Carat": "N/A",
    "1 Carat": "N/A",
    "1.5 Carat": "N/A",
    "2 Carat": "N/A",
    "3 Carat": "N/A",
  });

  // State for historical rates
  const [historicalRates, setHistoricalRates] = useState([]);

  // State for add rates modal
  const [addRatesOpen, setAddRatesOpen] = useState(false);
  const [newRates, setNewRates] = useState({
    date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    gold: { "24K": "", "23K": "", "22K": "", "20K": "", "18K": "" },
    silver: "",
    diamond: {
      "0.5 Carat": "",
      "1 Carat": "",
      "1.5 Carat": "",
      "2 Carat": "",
      "3 Carat": "",
    },
  });
  const [formErrors, setFormErrors] = useState({});

  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("success");
  const [lastUpdateAction, setLastUpdateAction] = useState(null);

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
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.3, ease: "easeOut" },
    },
  };

  // Fetch all rates and filter last 7 days
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/getAllDailrates");
        const allRates = Array.isArray(response.data) ? response.data : [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const lastSevenDaysRates = allRates
          .filter((rate) => new Date(rate.date) >= sevenDaysAgo)
          .map((rate) => ({
            ...rate,
            rate: {
              ...rate.rate,
              daimond: {
                "0.5 Carat": rate.rate.daimond["0_5 Carat"] || "N/A",
                "1 Carat": rate.rate.daimond["1 Carat"] || "N/A",
                "1.5 Carat": rate.rate.daimond["1_5 Carat"] || "N/A",
                "2 Carat": rate.rate.daimond["2 Carat"] || "N/A",
                "3 Carat": rate.rate.daimond["3 Carat"] || "N/A",
              },
            },
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistoricalRates(lastSevenDaysRates);

        if (lastSevenDaysRates.length > 0) {
          const latestRate = lastSevenDaysRates[0].rate;
          setGoldRates({
            "24K": latestRate.gold["24K"] || "N/A",
            "23K": latestRate.gold["23K"] || "N/A",
            "22K": latestRate.gold["22K"] || "N/A",
            "20K": latestRate.gold["20K"] || "N/A",
            "18K": latestRate.gold["18K"] || "N/A",
          });
          setSilverRate(latestRate.silver || "N/A");
          setDiamondRates({
            "0.5 Carat": latestRate.daimond["0.5 Carat"] || "N/A",
            "1 Carat": latestRate.daimond["1 Carat"] || "N/A",
            "1.5 Carat": latestRate.daimond["1.5 Carat"] || "N/A",
            "2 Carat": latestRate.daimond["2 Carat"] || "N/A",
            "3 Carat": latestRate.daimond["3 Carat"] || "N/A",
          });
        }
      } catch (error) {
        console.error("Error fetching rates:", error);
        setDialogMessage(
          error.response?.data?.message || "Failed to fetch rates"
        );
        setDialogType("error");
        setDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle input changes
  const handleNewRateChange = (category, key) => (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) > 0)) {
      if (category === "silver") {
        setNewRates({ ...newRates, silver: value });
      } else if (category === "date") {
        setNewRates({ ...newRates, date: value });
      } else {
        setNewRates({
          ...newRates,
          [category]: { ...newRates[category], [key]: value },
        });
      }
      setFormErrors((prev) => ({ ...prev, [key]: null }));
    } else {
      console.log("Invalid input:", { category, key, value });
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!newRates.date || !/^\d{4}-\d{2}-\d{2}$/.test(newRates.date)) {
      errors.date = "Valid date (YYYY-MM-DD) is required";
    }
    Object.keys(newRates.gold).forEach((purity) => {
      const value = newRates.gold[purity];
      if (value === "" || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
        errors[purity] = `${purity} rate must be a positive number`;
      }
    });
    if (
      newRates.silver === "" ||
      isNaN(parseFloat(newRates.silver)) ||
      parseFloat(newRates.silver) <= 0
    ) {
      errors.silver = "Silver rate must be a positive number";
    }
    Object.keys(newRates.diamond).forEach((type) => {
      const value = newRates.diamond[type];
      if (value === "" || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
        errors[type] = `${type} rate must be a positive number`;
      }
    });
    setFormErrors(errors);
    console.log("Validation errors:", errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleAddRates = async () => {
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors);
      return;
    }
    setIsLoading(true);
    const rateData = {
      date: newRates.date,
      rate: {
        gold: {
          "24K": parseFloat(newRates.gold["24K"]),
          "23K": parseFloat(newRates.gold["23K"]),
          "22K": parseFloat(newRates.gold["22K"]),
          "20K": parseFloat(newRates.gold["20K"]),
          "18K": parseFloat(newRates.gold["18K"]),
        },
        silver: parseFloat(newRates.silver),
        daimond: {
          "0_5 Carat": parseFloat(newRates.diamond["0.5 Carat"]),
          "1 Carat": parseFloat(newRates.diamond["1 Carat"]),
          "1_5 Carat": parseFloat(newRates.diamond["1.5 Carat"]),
          "2 Carat": parseFloat(newRates.diamond["2 Carat"]),
          "2_5 Carat": 0, // Satisfy backend schema
          "3 Carat": parseFloat(newRates.diamond["3 Carat"]),
        },
      },
    };
    console.log("Submitting rateData:", rateData);
    try {
      const response = await api.post("/createDailrate", rateData);
      // Refresh data after successful submission
      const updatedResponse = await api.get("/getAllDailrates");
      const allRates = Array.isArray(updatedResponse.data)
        ? updatedResponse.data
        : [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const lastSevenDaysRates = allRates
        .filter((rate) => new Date(rate.date) >= sevenDaysAgo)
        .map((rate) => ({
          ...rate,
          rate: {
            ...rate.rate,
            daimond: {
              "0.5 Carat": rate.rate.daimond["0_5 Carat"] || "N/A",
              "1 Carat": rate.rate.daimond["1 Carat"] || "N/A",
              "1.5 Carat": rate.rate.daimond["1_5 Carat"] || "N/A",
              "2 Carat": rate.rate.daimond["2 Carat"] || "N/A",
              "3 Carat": rate.rate.daimond["3 Carat"] || "N/A",
            },
          },
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistoricalRates(lastSevenDaysRates);

      const latestRate = lastSevenDaysRates[0].rate;
      setGoldRates({
        "24K": latestRate.gold["24K"] || "N/A",
        "23K": latestRate.gold["23K"] || "N/A",
        "22K": latestRate.gold["22K"] || "N/A",
        "20K": latestRate.gold["20K"] || "N/A",
        "18K": latestRate.gold["18K"] || "N/A",
      });
      setSilverRate(latestRate.silver || "N/A");
      setDiamondRates({
        "0.5 Carat": latestRate.daimond["0.5 Carat"] || "N/A",
        "1 Carat": latestRate.daimond["1 Carat"] || "N/A",
        "1.5 Carat": latestRate.daimond["1.5 Carat"] || "N/A",
        "2 Carat": latestRate.daimond["2 Carat"] || "N/A",
        "3 Carat": latestRate.daimond["3 Carat"] || "N/A",
      });

      setDialogMessage("Rates added successfully");
      setDialogType("success");
      setDialogOpen(true);
      setAddRatesOpen(false);
      setNewRates({
        date: new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }),
        gold: { "24K": "", "23K": "", "22K": "", "20K": "", "18K": "" },
        silver: "",
        diamond: {
          "0.5 Carat": "",
          "1 Carat": "",
          "1.5 Carat": "",
          "2 Carat": "",
          "3 Carat": "",
        },
      });
      setFormErrors({});
    } catch (error) {
      console.error("Error adding rates:", error);
      setDialogMessage(error.response?.data?.message || "Failed to add rates");
      setDialogType("error");
      setDialogOpen(true);
      setLastUpdateAction(() => handleAddRates); // Allow retry on error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update today's rates
  const handleUpdateClick = () => {
    setNewRates({
      date: new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }),
      gold: { "24K": "", "23K": "", "22K": "", "20K": "", "18K": "" },
      silver: "",
      diamond: {
        "0.5 Carat": "",
        "1 Carat": "",
        "1.5 Carat": "",
        "2 Carat": "",
        "3 Carat": "",
      },
    });
    setAddRatesOpen(true);
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

  // Handle add rates modal open/close
  const handleOpenAddRates = () => setAddRatesOpen(true);
  const handleCloseAddRates = () => {
    setAddRatesOpen(false);
    setNewRates({
      date: new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }),
      gold: { "24K": "", "23K": "", "22K": "", "20K": "", "18K": "" },
      silver: "",
      diamond: {
        "0.5 Carat": "",
        "1 Carat": "",
        "1.5 Carat": "",
        "2 Carat": "",
        "3 Carat": "",
      },
    });
    setFormErrors({});
  };

  // Current date and time
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
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddRates}
            disabled={isLoading}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Add Rates
          </Button>
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
                p: 3.5,
                textAlign: "center",
                bgcolor: `linear-gradient(135deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light}20)`,
                border: `2px solid ${theme.palette.primary.main}30`,
                borderRadius: 10,
                boxShadow: theme.shadows[6],
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                "&:hover": {
                  boxShadow: theme.shadows[10],
                  borderColor: theme.palette.primary.main,
                },
                height: "100%",
              }}
            >
              <MonetizationOn
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  transition: "color 0.3s ease",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  mt: 1.5,
                  mb: 2,
                  fontWeight: 700,
                }}
              >
                Gold Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2.5,
                  fontWeight: 500,
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              {["24K", "23K", "22K", "20K", "18K"].map((purity) => (
                <Box key={purity} sx={{ mb: 2.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    {purity}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.primary.main,
                      mt: 1,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      display: "inline-block",
                    }}
                  >
                    {goldRates[purity]} ₹/gm
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
                p: 3.5,
                textAlign: "center",
                bgcolor: `linear-gradient(135deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light}20)`,
                border: `2px solid ${theme.palette.primary.main}30`,
                borderRadius: 10,
                boxShadow: theme.shadows[6],
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                "&:hover": {
                  boxShadow: theme.shadows[10],
                  borderColor: theme.palette.primary.main,
                },
                height: "100%",
              }}
            >
              <Grain
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  transition: "color 0.3s ease",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  mt: 1.5,
                  mb: 2,
                  fontWeight: 700,
                }}
              >
                Silver Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2.5,
                  fontWeight: 500,
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  Silver
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.primary.main,
                    mt: 1,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    backgroundColor: `${theme.palette.primary.main}10`,
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    display: "inline-block",
                  }}
                >
                  {silverRate} ₹/g
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
                p: 3.5,
                textAlign: "center",
                bgcolor: `linear-gradient(135deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light}20)`,
                border: `2px solid ${theme.palette.primary.main}30`,
                borderRadius: 10,
                boxShadow: theme.shadows[6],
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                "&:hover": {
                  boxShadow: theme.shadows[10],
                  borderColor: theme.palette.primary.main,
                },
                height: "100%",
              }}
            >
              <Diamond
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  transition: "color 0.3s ease",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  mt: 1.5,
                  mb: 2,
                  fontWeight: 700,
                }}
              >
                Diamond Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2.5,
                  fontWeight: 500,
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              {["0.5 Carat", "1 Carat", "1.5 Carat", "2 Carat", "3 Carat"].map(
                (type) => (
                  <Box key={type} sx={{ mb: 2.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      {type}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.primary.main,
                        mt: 1,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        backgroundColor: `${theme.palette.primary.main}10`,
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        display: "inline-block",
                      }}
                    >
                      {diamondRates[type]} ₹/pc
                    </Typography>
                  </Box>
                )
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Historical Rates Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <Typography
          variant="h5"
          sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: "bold" }}
        >
          Last 7 Days Rates
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            borderRadius: 8,
            boxShadow: theme.shadows[4],
            "&:hover": { boxShadow: theme.shadows[8] },
            mb: 4,
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
                <TableCell>Date</TableCell>
                <TableCell>Gold 24K (₹/gm)</TableCell>
                <TableCell>Gold 22K (₹/gm)</TableCell>
                <TableCell>Silver (₹/g)</TableCell>
                <TableCell>Diamond 1 Carat (₹/pc)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historicalRates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center" }}>
                    No rates available for the last 7 days
                  </TableCell>
                </TableRow>
              ) : (
                historicalRates.map((rate, index) => (
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
                      {new Date(rate.date).toLocaleDateString("en-CA")}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {rate.rate.gold["24K"] || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {rate.rate.gold["22K"] || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {rate.rate.silver || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {rate.rate.daimond["1 Carat"] || "N/A"}
                    </TableCell>
                    <TableCell>
                      <canvas id={`qrcode-${item}`}></canvas>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
      {/* Add Rates Modal */}
      <Dialog open={addRatesOpen} onClose={handleCloseAddRates}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Add Rates
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            value={newRates.date}
            onChange={handleNewRateChange("date")}
            error={!!formErrors.date}
            helperText={formErrors.date}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Gold Rates (₹/gm)
          </Typography>
          {["24K", "23K", "22K", "20K", "18K"].map((purity) => (
            <TextField
              key={purity}
              label={`${purity} Rate`}
              type="number"
              fullWidth
              margin="dense"
              value={newRates.gold[purity]}
              onChange={handleNewRateChange("gold", purity)}
              error={!!formErrors[purity]}
              helperText={formErrors[purity]}
              inputProps={{ min: 0 }}
              sx={{ mb: 2 }}
            />
          ))}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Silver Rate (₹/g)
          </Typography>
          <TextField
            label="Silver Rate"
            type="number"
            fullWidth
            margin="dense"
            value={newRates.silver}
            onChange={handleNewRateChange("silver")}
            error={!!formErrors.silver}
            helperText={formErrors.silver}
            inputProps={{ min: 0 }}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Diamond Rates (₹/pc)
          </Typography>
          {["0.5 Carat", "1 Carat", "1.5 Carat", "2 Carat", "3 Carat"].map(
            (type) => (
              <TextField
                key={type}
                label={`${type} Rate`}
                type="number"
                fullWidth
                margin="dense"
                value={newRates.diamond[type]}
                onChange={handleNewRateChange("diamond", type)}
                error={!!formErrors[type]}
                helperText={formErrors[type]}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseAddRates}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddRates}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Save Rates
          </Button>
        </DialogActions>
      </Dialog>
      {/* Success/Error Dialog */}
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
