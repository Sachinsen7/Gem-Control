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
import { MonetizationOn, Grain, Diamond, Update } from "@mui/icons-material";
import api from "../utils/api";

function RatesManagement() {
  const theme = useTheme();
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
  const [historicalRates, setHistoricalRates] = useState([]);
  const [openGoldModal, setOpenGoldModal] = useState(false);
  const [openSilverModal, setOpenSilverModal] = useState(false);
  const [openDiamondModal, setOpenDiamondModal] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("success");
  const [lastUpdateAction, setLastUpdateAction] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, []);

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

  const validateForm = (material) => {
    const errors = {};
    if (!newRates.date || !/^\d{4}-\d{2}-\d{2}$/.test(newRates.date)) {
      errors.date = "Valid date (YYYY-MM-DD) is required";
    }
    if (material === "gold") {
      Object.keys(newRates.gold).forEach((purity) => {
        const value = newRates.gold[purity];
        if (
          value === "" ||
          isNaN(parseFloat(value)) ||
          parseFloat(value) <= 0
        ) {
          errors[purity] = `${purity} rate must be a positive number`;
        }
      });
    } else if (material === "silver") {
      if (
        newRates.silver === "" ||
        isNaN(parseFloat(newRates.silver)) ||
        parseFloat(newRates.silver) <= 0
      ) {
        errors.silver = "Silver rate must be a positive number";
      }
    } else if (material === "diamond") {
      Object.keys(newRates.diamond).forEach((type) => {
        const value = newRates.diamond[type];
        if (
          value === "" ||
          isNaN(parseFloat(value)) ||
          parseFloat(value) <= 0
        ) {
          errors[type] = `${type} rate must be a positive number`;
        }
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveGoldRates = async () => {
    if (!validateForm("gold")) {
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
        silver: parseFloat(silverRate) || 0,
        daimond: {
          "0_5 Carat": parseFloat(diamondRates["0.5 Carat"]) || 0,
          "1 Carat": parseFloat(diamondRates["1 Carat"]) || 0,
          "1_5 Carat": parseFloat(diamondRates["1.5 Carat"]) || 0,
          "2 Carat": parseFloat(diamondRates["2 Carat"]) || 0,
          "2_5 Carat": 0,
          "3 Carat": parseFloat(diamondRates["3 Carat"]) || 0,
        },
      },
    };
    try {
      await api.post("/createDailrate", rateData);
      await fetchData();
      setDialogMessage("Gold rates updated successfully");
      setDialogType("success");
      setDialogOpen(true);
      setOpenGoldModal(false);
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
      console.error("Error updating gold rates:", error);
      setDialogMessage(
        error.response?.data?.message || "Failed to update gold rates"
      );
      setDialogType("error");
      setDialogOpen(true);
      setLastUpdateAction(() => handleSaveGoldRates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSilverRates = async () => {
    if (!validateForm("silver")) {
      return;
    }
    setIsLoading(true);
    const rateData = {
      date: newRates.date,
      rate: {
        gold: {
          "24K": parseFloat(goldRates["24K"]) || 0,
          "23K": parseFloat(goldRates["23K"]) || 0,
          "22K": parseFloat(goldRates["22K"]) || 0,
          "20K": parseFloat(goldRates["20K"]) || 0,
          "18K": parseFloat(goldRates["18K"]) || 0,
        },
        silver: parseFloat(newRates.silver),
        daimond: {
          "0_5 Carat": parseFloat(diamondRates["0.5 Carat"]) || 0,
          "1 Carat": parseFloat(diamondRates["1 Carat"]) || 0,
          "1_5 Carat": parseFloat(diamondRates["1.5 Carat"]) || 0,
          "2 Carat": parseFloat(diamondRates["2 Carat"]) || 0,
          "2_5 Carat": 0,
          "3 Carat": parseFloat(diamondRates["3 Carat"]) || 0,
        },
      },
    };
    try {
      await api.post("/createDailrate", rateData);
      await fetchData();
      setDialogMessage("Silver rate updated successfully");
      setDialogType("success");
      setDialogOpen(true);
      setOpenSilverModal(false);
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
      console.error("Error updating silver rate:", error);
      setDialogMessage(
        error.response?.data?.message || "Failed to update silver rate"
      );
      setDialogType("error");
      setDialogOpen(true);
      setLastUpdateAction(() => handleSaveSilverRates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDiamondRates = async () => {
    if (!validateForm("diamond")) {
      return;
    }
    setIsLoading(true);
    const rateData = {
      date: newRates.date,
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
          "0_5 Carat": parseFloat(newRates.diamond["0.5 Carat"]),
          "1 Carat": parseFloat(newRates.diamond["1 Carat"]),
          "1_5 Carat": parseFloat(newRates.diamond["1.5 Carat"]),
          "2 Carat": parseFloat(newRates.diamond["2 Carat"]),
          "2_5 Carat": 0,
          "3 Carat": parseFloat(newRates.diamond["3 Carat"]),
        },
      },
    };
    try {
      await api.post("/createDailrate", rateData);
      await fetchData();
      setDialogMessage("Diamond rates updated successfully");
      setDialogType("success");
      setDialogOpen(true);
      setOpenDiamondModal(false);
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
      console.error("Error updating diamond rates:", error);
      setDialogMessage(
        error.response?.data?.message || "Failed to update diamond rates"
      );
      setDialogType("error");
      setDialogOpen(true);
      setLastUpdateAction(() => handleSaveDiamondRates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGoldModal = () => {
    setNewRates({
      ...newRates,
      gold: { ...goldRates },
    });
    setOpenGoldModal(true);
  };
  const handleOpenSilverModal = () => {
    setNewRates({
      ...newRates,
      silver: silverRate,
    });
    setOpenSilverModal(true);
  };
  const handleOpenDiamondModal = () => {
    setNewRates({
      ...newRates,
      diamond: { ...diamondRates },
    });
    setOpenDiamondModal(true);
  };

  const handleCloseGoldModal = () => {
    setOpenGoldModal(false);
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
  const handleCloseSilverModal = () => {
    setOpenSilverModal(false);
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
  const handleCloseDiamondModal = () => {
    setOpenDiamondModal(false);
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

  const handleRefreshRates = async () => {
    setIsLoading(true);
    try {
      await fetchData();
      setDialogMessage("Rates refreshed successfully");
      setDialogType("success");
      setDialogOpen(true);
    } catch (error) {
      console.error("Error refreshing rates:", error);
      setDialogMessage(
        error.response?.data?.message || "Failed to refresh rates"
      );
      setDialogType("error");
      setDialogOpen(true);
      setLastUpdateAction(() => handleRefreshRates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setLastUpdateAction(null);
  };

  const handleRetry = () => {
    setDialogOpen(false);
    if (lastUpdateAction) {
      lastUpdateAction();
    }
  };

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
      <Box
        sx={{
          textAlign: "center",
          mt: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
        <Typography
          variant="body1"
          sx={{ mt: 2, fontSize: { xs: "0.9rem", sm: "1rem" } }}
        >
          Loading rates...
        </Typography>
      </Box>
    );
  }

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
          Rates Management
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="contained"
            startIcon={<Update />}
            onClick={handleRefreshRates}
            disabled={isLoading}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Refresh Rates
          </Button>
        </Box>
      </Box>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
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
                  fontSize: { xs: 36, sm: 48 },
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
                  fontSize: { xs: "1rem", sm: "1.25rem" },
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
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              {["24K", "23K", "22K", "20K", "18K"].map((purity) => (
                <Box key={purity} sx={{ mb: { xs: 1.5, sm: 2.5 } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                      fontSize: { xs: "0.9rem", sm: "1.1rem" },
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderRadius: 2,
                      px: { xs: 1, sm: 1.5 },
                      py: 0.5,
                      display: "inline-block",
                    }}
                  >
                    {goldRates[purity]} ₹/gm
                  </Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenGoldModal}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                    },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Update Rates
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
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
                  fontSize: { xs: 36, sm: 48 },
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
                  fontSize: { xs: "1rem", sm: "1.25rem" },
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
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              <Box sx={{ mb: { xs: 1.5, sm: 2.5 } }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    backgroundColor: `${theme.palette.primary.main}10`,
                    borderRadius: 2,
                    px: { xs: 1, sm: 1.5 },
                    py: 0.5,
                    display: "inline-block",
                  }}
                >
                  {silverRate} ₹/g
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenSilverModal}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                    },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Update Rates
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
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
                  fontSize: { xs: 36, sm: 48 },
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
                  fontSize: { xs: "1rem", sm: "1.25rem" },
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
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              {["0.5 Carat", "1 Carat", "1.5 Carat", "2 Carat", "3 Carat"].map(
                (type) => (
                  <Box key={type} sx={{ mb: { xs: 1.5, sm: 2.5 } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                        fontSize: { xs: "0.9rem", sm: "1.1rem" },
                        backgroundColor: `${theme.palette.primary.main}10`,
                        borderRadius: 2,
                        px: { xs: 1, sm: 1.5 },
                        py: 0.5,
                        display: "inline-block",
                      }}
                    >
                      {diamondRates[type]} ₹/pc
                    </Typography>
                  </Box>
                )
              )}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenDiamondModal}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                    },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  Update Rates
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <Typography
          variant="h5"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
            fontWeight: "bold",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
          }}
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
                <TableCell>Date</TableCell>
                <TableCell>Gold 24K (₹/gm)</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  Gold 22K (₹/gm)
                </TableCell>
                <TableCell>Silver (₹/g)</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  Diamond 1 Carat (₹/pc)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historicalRates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{
                      textAlign: "center",
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    }}
                  >
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
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        px: { xs: 1, sm: 2 },
                      },
                    }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {new Date(rate.date).toLocaleDateString("en-CA")}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {rate.rate.gold["24K"] || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {rate.rate.gold["22K"] || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {rate.rate.silver || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {rate.rate.daimond["1 Carat"] || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      <Dialog
        open={openGoldModal}
        onClose={handleCloseGoldModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          Update Gold Rates
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            value={newRates.date}
            onChange={handleNewRateChange("date")}
            error={!!formErrors.date}
            helperText={formErrors.date}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: { xs: 1, sm: 2 },
              mb: 1,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
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
              sx={{
                mb: { xs: 1, sm: 2 },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            />
          ))}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCloseGoldModal}
            sx={{
              color: theme.palette.text.primary,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveGoldRates}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Save Gold Rates
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSilverModal}
        onClose={handleCloseSilverModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          Update Silver Rate
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            value={newRates.date}
            onChange={handleNewRateChange("date")}
            error={!!formErrors.date}
            helperText={formErrors.date}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: { xs: 1, sm: 2 },
              mb: 1,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
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
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCloseSilverModal}
            sx={{
              color: theme.palette.text.primary,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSilverRates}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Save Silver Rate
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDiamondModal}
        onClose={handleCloseDiamondModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          Update Diamond Rates
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            value={newRates.date}
            onChange={handleNewRateChange("date")}
            error={!!formErrors.date}
            helperText={formErrors.date}
            sx={{
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: { xs: 1, sm: 2 },
              mb: 1,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
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
                sx={{
                  mb: { xs: 1, sm: 2 },
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
              />
            )
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCloseDiamondModal}
            sx={{
              color: theme.palette.text.primary,
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDiamondRates}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Save Diamond Rates
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            color: dialogType === "success" ? "green" : "red",
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          {dialogType === "success" ? "Success" : "Error"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleDialogClose}
            color="primary"
            sx={{
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            OK
          </Button>
          {dialogType === "error" && lastUpdateAction && (
            <Button
              onClick={handleRetry}
              color="secondary"
              sx={{
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              Retry
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RatesManagement;
