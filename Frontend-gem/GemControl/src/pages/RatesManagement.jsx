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
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardContent,
  CardActions,
  Pagination,
  IconButton,
} from "@mui/material";

import { Close } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MonetizationOn, Grain, Diamond, Update } from "@mui/icons-material";
import api from "../utils/api";
import { toast } from "react-toastify";

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
    "2.5 Carat": "N/A",
    "3 Carat": "N/A",
  });
  const [historicalRates, setHistoricalRates] = useState([]);
  const [openGoldModal, setOpenGoldModal] = useState(false);
  const [openSilverModal, setOpenSilverModal] = useState(false);
  const [openDiamondModal, setOpenDiamondModal] = useState(false);
  const [newRates, setNewRates] = useState({
    _id: null,
    date: new Date().toLocaleDateString("en-CA"),
    gold: { "24K": "", "23K": "", "22K": "", "20K": "", "18K": "" },
    silver: "",
    diamond: {
      "0.5 Carat": "",
      "1 Carat": "",
      "1.5 Carat": "",
      "2 Carat": "",
      "2.5 Carat": "",
      "3 Carat": "",
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("success");
  const [lastUpdateAction, setLastUpdateAction] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 7;

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

  // Helper function to map frontend diamond keys to backend keys
  const mapFrontendDiamondToBackend = (frontendDiamondRates) => {
    return {
      "0_5 Carat": parseFloat(frontendDiamondRates["0.5 Carat"]) || 0,
      "1 Carat": parseFloat(frontendDiamondRates["1 Carat"]) || 0,
      "1_5 Carat": parseFloat(frontendDiamondRates["1.5 Carat"]) || 0,
      "2 Carat": parseFloat(frontendDiamondRates["2 Carat"]) || 0,
      "2_5 Carat": parseFloat(frontendDiamondRates["2.5 Carat"]) || 0,
      "3 Carat": parseFloat(frontendDiamondRates["3 Carat"]) || 0,
    };
  };

  // Helper function to map backend diamond keys to frontend keys
  const mapBackendDiamondToFrontend = (backendDiamondRates) => {
    return {
      "0.5 Carat": backendDiamondRates?.["0_5 Carat"] || "N/A",
      "1 Carat": backendDiamondRates?.["1 Carat"] || "N/A",
      "1.5 Carat": backendDiamondRates?.["1_5 Carat"] || "N/A",
      "2 Carat": backendDiamondRates?.["2 Carat"] || "N/A",
      "2.5 Carat": backendDiamondRates?.["2_5 Carat"] || "N/A",
      "3 Carat": backendDiamondRates?.["3 Carat"] || "N/A",
    };
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/getAllDailrates");
      const allRates = Array.isArray(response.data) ? response.data : [];

      const processedRates = allRates.map((rate) => ({
        ...rate,
        rate: {
          ...rate.rate,
          diamond: mapBackendDiamondToFrontend(rate.rate.daimond),
        },
      }));

      setHistoricalRates(
        processedRates.sort((a, b) => new Date(b.date) - new Date(a.date))
      );

      if (processedRates.length > 0) {
        const latestRate = processedRates[0].rate;
        setGoldRates({
          "24K": latestRate.gold?.["24K"] || "N/A",
          "23K": latestRate.gold?.["23K"] || "N/A",
          "22K": latestRate.gold?.["22K"] || "N/A",
          "20K": latestRate.gold?.["20K"] || "N/A",
          "18K": latestRate.gold?.["18K"] || "N/A",
        });
        setSilverRate(latestRate.silver || "N/A");
        setDiamondRates(mapBackendDiamondToFrontend(latestRate.daimond));
      } else {
        setGoldRates({
          "24K": "N/A",
          "23K": "N/A",
          "22K": "N/A",
          "20K": "N/A",
          "18K": "N/A",
        });
        setSilverRate("N/A");
        setDiamondRates({
          "0.5 Carat": "N/A",
          "1 Carat": "N/A",
          "1.5 Carat": "N/A",
          "2.5 Carat": "N/A",
          "3 Carat": "N/A",
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNewRateChange = (category, key) => (e) => {
    const value = e.target.value;
    setNewRates((prev) => {
      let updated = { ...prev };
      if (category === "silver") {
        updated.silver = value;
      } else if (category === "date") {
        updated.date = value;
      } else {
        updated[category] = { ...prev[category], [key]: value };
      }
      return updated;
    });
    setFormErrors((prev) => ({ ...prev, [key]: null, date: null }));
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
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill all required fields correctly.");
    }
    return Object.keys(errors).length === 0;
  };

  const handleSaveRates = async (materialType) => {
    if (!validateForm(materialType)) {
      return;
    }
    setIsLoading(true);

    const existingRateForDate = historicalRates.find(
      (rate) =>
        new Date(rate.date).toLocaleDateString("en-CA") ===
        new Date(newRates.date).toLocaleDateString("en-CA")
    );

    let rateDataToSend = {
      date: newRates.date,
      rate: {
        gold:
          existingRateForDate?.rate?.gold ||
          Object.fromEntries(
            Object.keys(goldRates).map((k) => [
              k,
              parseFloat(goldRates[k]) || 0,
            ])
          ),
        silver:
          existingRateForDate?.rate?.silver || parseFloat(silverRate) || 0,
        daimond:
          existingRateForDate?.rate?.daimond ||
          mapFrontendDiamondToBackend(diamondRates),
      },
    };

    if (materialType === "gold") {
      rateDataToSend.rate.gold = Object.fromEntries(
        Object.keys(newRates.gold).map((purity) => [
          purity,
          parseFloat(newRates.gold[purity]) || 0,
        ])
      );
    } else if (materialType === "silver") {
      rateDataToSend.rate.silver = parseFloat(newRates.silver) || 0;
    } else if (materialType === "diamond") {
      rateDataToSend.rate.daimond = mapFrontendDiamondToBackend(
        newRates.diamond
      );
    }

    try {
      if (existingRateForDate) {
        await api.put("/updateDailrate", {
          ...rateDataToSend,
          _id: existingRateForDate._id,
        });
        setDialogMessage(
          `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} rates updated successfully!`
        );
      } else {
        await api.post("/createDailrate", rateDataToSend);
        setDialogMessage(
          `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} rates added successfully!`
        );
      }
      setDialogType("success");
      setDialogOpen(true);
      await fetchData();

      if (materialType === "gold") setOpenGoldModal(false);
      else if (materialType === "silver") setOpenSilverModal(false);
      else if (materialType === "diamond") setOpenDiamondModal(false);

      resetNewRatesForm();
      setFormErrors({});
    } catch (error) {
      console.error(`Error saving ${materialType} rates:`, error);
      setDialogMessage(
        error.response?.data?.message || `Failed to save ${materialType} rates`
      );
      setDialogType("error");
      setDialogOpen(true);
      setLastUpdateAction(() => () => handleSaveRates(materialType));
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewRatesForm = () => {
    setNewRates({
      _id: null,
      date: new Date().toLocaleDateString("en-CA"),
      gold: { "24K": "", "23K": "", "22K": "", "20K": "", "18K": "" },
      silver: "",
      diamond: {
        "0.5 Carat": "",
        "1 Carat": "",
        "1.5 Carat": "",
        "2 Carat": "",
        "2.5 Carat": "",
        "3 Carat": "",
      },
    });
  };

  const handleOpenModal = (materialType) => () => {
    const today = new Date().toLocaleDateString("en-CA");
    const existingRate = historicalRates.find(
      (rate) => new Date(rate.date).toLocaleDateString("en-CA") === today
    );

    const initialNewRates = {
      _id: existingRate?._id || null,
      date: today,
      gold: existingRate?.rate?.gold
        ? { ...existingRate.rate.gold }
        : { "24K": "", "23K": "", "22K": "", "20K": "", "18K": "" },
      silver: existingRate?.rate?.silver || "",
      diamond: existingRate?.rate?.daimond
        ? mapBackendDiamondToFrontend(existingRate.rate.daimond)
        : {
            "0.5 Carat": "",
            "1 Carat": "",
            "1.5 Carat": "",
            "2 Carat": "",
            "2.5 Carat": "",
            "3 Carat": "",
          },
    };

    setNewRates(initialNewRates);
    setFormErrors({});

    if (materialType === "gold") setOpenGoldModal(true);
    else if (materialType === "silver") setOpenSilverModal(true);
    else if (materialType === "diamond") setOpenDiamondModal(true);
  };

  const handleCloseGoldModal = () => {
    setOpenGoldModal(false);
    resetNewRatesForm();
    setFormErrors({});
  };
  const handleCloseSilverModal = () => {
    setOpenSilverModal(false);
    resetNewRatesForm();
    setFormErrors({});
  };
  const handleCloseDiamondModal = () => {
    setOpenDiamondModal(false);
    resetNewRatesForm();
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

  const currentDateTime = new Date().toLocaleString("en-IN", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const paginatedHistoricalRates = useMemo(
    () =>
      historicalRates.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      ),
    [historicalRates, page]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
        <Typography
          variant="body1"
          sx={{ mt: 2, fontSize: { xs: "0.75rem", sm: "1rem" } }}
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
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          mb: { xs: 2, sm: 3, md: 4 },
        }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: "bold",
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              textAlign: { xs: "center", sm: "left" },
              mb: { xs: 1, sm: 0 },
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
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Update />}
              onClick={handleRefreshRates}
              disabled={isLoading}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                "&:hover": { bgcolor: theme.palette.primary.dark },
                borderRadius: 1,
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
              }}
              aria-label="Refresh rates"
            >
              Refresh Rates
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid
        container
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ mb: { xs: 2, sm: 3, md: 4 }, flexGrow: 0 }}
      >
        {/* Gold Rates Card */}
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
                p: { xs: 1, sm: 2, md: 3 },
                textAlign: "center",
                bgcolor: `linear-gradient(135deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light}20)`,
                border: `2px solid ${theme.palette.primary.main}30`,
                borderRadius: 2,
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
                  fontSize: { xs: 30, sm: 36, md: 48 },
                  color: theme.palette.primary.main,
                  transition: "color 0.3s ease",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  mt: 1,
                  mb: 1.5,
                  fontWeight: 700,
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                }}
              >
                Gold Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 1.5,
                  fontWeight: 500,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              {["24K", "23K", "22K", "20K", "18K"].map((purity) => (
                <Box key={purity} sx={{ mb: { xs: 1, sm: 1.5 } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {purity}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.primary.main,
                      mt: 0.5,
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderRadius: 1,
                      px: { xs: 0.5, sm: 1 },
                      py: 0.25,
                      display: "inline-block",
                    }}
                  >
                    {goldRates[purity]} ₹/gm
                  </Typography>
                </Box>
              ))}
              <Box sx={{ mt: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenModal("gold")}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                    },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                  }}
                  aria-label="Update gold rates"
                >
                  Update Rates
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        {/* Silver Rate Card */}
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
                p: { xs: 1, sm: 2, md: 3 },
                textAlign: "center",
                bgcolor: `linear-gradient(135deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light}20)`,
                border: `2px solid ${theme.palette.primary.main}30`,
                borderRadius: 2,
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
                  fontSize: { xs: 30, sm: 36, md: 48 },
                  color: theme.palette.primary.main,
                  transition: "color 0.3s ease",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  mt: 1,
                  mb: 1.5,
                  fontWeight: 700,
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                }}
              >
                Silver Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 1.5,
                  fontWeight: 500,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                Updated: {currentDateTime}
              </Typography>
              <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Silver
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.primary.main,
                    mt: 0.5,
                    fontWeight: 700,
                    fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                    backgroundColor: `${theme.palette.primary.main}10`,
                    borderRadius: 1,
                    px: { xs: 0.5, sm: 1 },
                    py: 0.25,
                    display: "inline-block",
                  }}
                >
                  {silverRate} ₹/g
                </Typography>
              </Box>
              <Box sx={{ mt: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenModal("silver")}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                    },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                  }}
                  aria-label="Update silver rates"
                >
                  Update Rates
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        {/* Diamond Rates Card */}
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
                p: { xs: 1, sm: 2, md: 3 },
                textAlign: "center",
                bgcolor: `linear-gradient(135deg, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light}20)`,
                border: `2px solid ${theme.palette.primary.main}30`,
                borderRadius: 2,
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
                  fontSize: { xs: 30, sm: 36, md: 48 },
                  color: theme.palette.primary.main,
                  transition: "color 0.3s ease",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  mt: 1,
                  mb: 1.5,
                  fontWeight: 700,
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                }}
              >
                Diamond Rates
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 1.5,
                  fontWeight: 500,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                Updated: {currentDateTime}
              </Typography>
             {["0.5 Carat", "1 Carat", "1.5 Carat", "2 Carat", "2.5 Carat", "3 Carat"].map((type) => (
                <Box key={type} sx={{ mb: { xs: 1, sm: 1.5 } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {type}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.primary.main,
                      mt: 0.5,
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                      backgroundColor: `${theme.palette.primary.main}10`,
                      borderRadius: 1,
                      px: { xs: 0.5, sm: 1 },
                      py: 0.25,
                      display: "inline-block",
                    }}
                  >
                    {diamondRates[type]} ₹/pc
                  </Typography>
                </Box>
              ))}
              <Box sx={{ mt: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={handleOpenModal("diamond")}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                    },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                  }}
                  aria-label="Update diamond rates"
                >
                  Update Rates
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <motion.div variants={tableVariants} initial="hidden" animate="visible">
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.primary,
              mb: 2,
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            }}
          >
            Last 7 Days Rates
          </Typography>

          {/* Mobile Card Layout */}
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            {paginatedHistoricalRates.length === 0 ? (
              <Typography
                sx={{
                  color: theme.palette.text.primary,
                  textAlign: "center",
                  py: { xs: 2, sm: 3 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                No rates available for the last 7 days
              </Typography>
            ) : (
              paginatedHistoricalRates.map((rate, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    borderRadius: 1,
                    boxShadow: theme.shadows[2],
                    "&:hover": { boxShadow: theme.shadows[4] },
                  }}
                >
                  <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        fontWeight: "bold",
                      }}
                    >
                      Date: {new Date(rate.date).toLocaleDateString("en-CA")}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      Gold 24K: {rate.rate.gold?.["24K"] || "N/A"} ₹/gm
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      Silver: {rate.rate.silver || "N/A"} ₹/g
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      Diamond 1 Carat: {rate.rate.diamond?.["1 Carat"] || "N/A"} ₹/pc
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>

          {/* Desktop Table Layout */}
          <TableContainer
            component={Paper}
            sx={{
              display: { xs: "none", sm: "block" },
              width: "100%",
              borderRadius: 1,
              boxShadow: theme.shadows[4],
              "&:hover": { boxShadow: theme.shadows[8] },
              mb: 2,
              overflowX: "auto",
            }}
          >
            <Table
              sx={{
                minWidth: 650,
                "& .MuiTableCell-root": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    "& th": {
                      fontWeight: "bold",
                      borderBottom: `2px solid ${theme.palette.secondary.main}`,
                      px: { xs: 1, sm: 2 },
                      py: 1,
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
                {paginatedHistoricalRates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      sx={{
                        textAlign: "center",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      No rates available for the last 7 days
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistoricalRates.map((rate, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { bgcolor: theme.palette.action.hover },
                        "& td": {
                          px: { xs: 1, sm: 2 },
                          py: 1,
                        },
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {new Date(rate.date).toLocaleDateString("en-CA")}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {rate.rate.gold?.["24K"] || "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        {rate.rate.gold?.["22K"] || "N/A"}
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
                        {rate.rate.diamond?.["1 Carat"] || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {historicalRates.length > 0 && (
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
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Total Records: {historicalRates.length}
              </Typography>
              <Pagination
                count={Math.ceil(historicalRates.length / itemsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
              />
            </Box>
          )}
        </motion.div>
      </Box>

      {/* Gold Modal */}
      <Dialog
        open={openGoldModal}
        onClose={handleCloseGoldModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 1,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "0.875rem", sm: "1rem" },
            position: "relative",
            py: { xs: 1, sm: 1.5 },
          }}
        >
          Update Gold Rates
          <IconButton
            onClick={handleCloseGoldModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            value={newRates.date}
            onChange={handleNewRateChange("date")}
            error={!!formErrors.date}
            helperText={formErrors.date}
            InputLabelProps={{ shrink: true }}
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
              "& .MuiInputLabel-root": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
            }}
            inputProps={{ "aria-label": "Select date" }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: { xs: 1, sm: 2 },
              mb: 1,
              fontSize: { xs: "0.875rem", sm: "1rem" },
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
              inputProps={{ min: 0, "aria-label": `${purity} gold rate` }}
              sx={{
                mb: { xs: 1, sm: 2 },
                "& .MuiInputBase-input": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
                "& .MuiInputLabel-root": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
              }}
            />
          ))}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
            pb: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCloseGoldModal}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSaveRates("gold")}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
            aria-label="Save gold rates"
          >
            Save Gold Rates
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silver Modal */}
      <Dialog
        open={openSilverModal}
        onClose={handleCloseSilverModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 1,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "0.875rem", sm: "1rem" },
            position: "relative",
            py: { xs: 1, sm: 1.5 },
          }}
        >
          Update Silver Rate
          <IconButton
            onClick={handleCloseSilverModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            value={newRates.date}
            onChange={handleNewRateChange("date")}
            error={!!formErrors.date}
            helperText={formErrors.date}
            InputLabelProps={{ shrink: true }}
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
              "& .MuiInputLabel-root": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
            }}
            inputProps={{ "aria-label": "Select date" }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: { xs: 1, sm: 2 },
              mb: 1,
              fontSize: { xs: "0.875rem", sm: "1rem" },
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
            inputProps={{ min: 0, "aria-label": "Silver rate" }}
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
              "& .MuiInputLabel-root": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
            pb: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCloseSilverModal}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSaveRates("silver")}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
            aria-label="Save silver rate"
          >
            Save Silver Rate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diamond Modal */}
      <Dialog
        open={openDiamondModal}
        onClose={handleCloseDiamondModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 1,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "0.875rem", sm: "1rem" },
            position: "relative",
            py: { xs: 1, sm: 1.5 },
          }}
        >
          Update Diamond Rates
          <IconButton
            onClick={handleCloseDiamondModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            value={newRates.date}
            onChange={handleNewRateChange("date")}
            error={!!formErrors.date}
            helperText={formErrors.date}
            InputLabelProps={{ shrink: true }}
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
              "& .MuiInputLabel-root": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
            }}
            inputProps={{ "aria-label": "Select date" }}
          />
          <Typography
            variant="h6"
            sx={{
              mt: { xs: 1, sm: 2 },
              mb: 1,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Diamond Rates (₹/pc)
          </Typography>
          {["0.5 Carat", "1 Carat", "1.5 Carat", "2 Carat", "2.5 Carat", "3 Carat"].map((type) => (
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
            inputProps={{ min: 0, "aria-label": `${type} diamond rate` }}
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
              "& .MuiInputLabel-root": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
            }}
          />
        ))}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
            pb: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCloseDiamondModal}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSaveRates("diamond")}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
            aria-label="Save diamond rates"
          >
            Save Diamond Rates
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: 400 },
            borderRadius: 1,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            color: dialogType === "success" ? "green" : "red",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            position: "relative",
            py: { xs: 1, sm: 1.5 },
          }}
        >
          {dialogType === "success" ? "Success" : "Error"}
          <IconButton
            onClick={handleDialogClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: theme.palette.text.primary,
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            {dialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
            pb: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleDialogClose}
            color="primary"
            sx={{
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
            aria-label="OK"
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
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
              aria-label="Retry"
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