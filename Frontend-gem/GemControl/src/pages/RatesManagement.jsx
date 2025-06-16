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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { MonetizationOn, Grain, Diamond, Update } from "@mui/icons-material";

function RatesManagement() {
  const theme = useTheme();

  // State to track if update dialog/modal is open
  const [updateOpen, setUpdateOpen] = useState(false);

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
    hover: {
      scale: 1.05,

      transition: { duration: 0.3 },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.6, ease: "easeOut" },
    },
  };

  // State for input values
  const [goldRates, setGoldRates] = useState({
    "24k(999)": "",
    "22k(916)": "",
    "18k(750)": "",
    "14k(585)": "",
  });
  const [silverRates, setSilverRates] = useState({
    "Pure Silver (999)": "",
    "Standard (925)": "",
  });
  const [diamondRates, setDiamondRates] = useState({
    "1 Carat (D-F, VVS)": "",
    "0.5 Carat (D-F, VVS)": "",
    "0.3 Carat (G-H, VS)": "",
  });

  // Handle input changes
  const handleGoldRateChange = (purity) => (e) => {
    setGoldRates({ ...goldRates, [purity]: e.target.value });
  };
  const handleSilverRateChange = (type) => (e) => {
    setSilverRates({ ...silverRates, [type]: e.target.value });
  };
  const handleDiamondRateChange = (type) => (e) => {
    setDiamondRates({ ...diamondRates, [type]: e.target.value });
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

  // Handler for button click
  const handleUpdateClick = () => {
    setUpdateOpen(true);
    // You can add more logic here (e.g., open a modal)
    console.log("Update Today's Rate button clicked");
  };

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
          sx={{
            bgcolor: theme.palette.primary.main, // #C99314
            color: theme.palette.text.primary, // #A76E19
            "&:hover": { bgcolor: "#b5830f" },
            borderRadius: 2,
          }}
        >
          Update Today's Rate
        </Button>
        {/* Example: Show a message or modal when updateOpen is true */}
        {updateOpen && (
          <Box sx={{ mt: 2, color: "green" }}>
            Update dialog/modal would open here!
          </Box>
        )}
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
              {["24k(999)", "22k(916)", "18k(750)", "14k(585)"].map(
                (purity) => (
                  <Box key={purity} sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                      }}
                    >
                      {purity}
                    </Typography>
                    <InputBase
                      type="number"
                      value={goldRates[purity]}
                      onChange={handleGoldRateChange(purity)}
                      placeholder="Enter rate (/gm)"
                      sx={{
                        width: "100%",
                        p: 1,
                        mt: 1,
                        bgcolor: "#fff",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 4,
                        color: theme.palette.text.primary,
                      }}
                    />
                  </Box>
                )
              )}
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
                Updated: Today, 10:30 AM
              </Typography>
              {["Pure Silver (999)", "Standard (925)"].map((type) => (
                <Box key={type} sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
                    {type}
                  </Typography>
                  <InputBase
                    type="number"
                    value={silverRates[type]}
                    onChange={handleSilverRateChange(type)}
                    placeholder="Enter rate (/g)"
                    sx={{
                      width: "100%",
                      p: 1,
                      mt: 1,
                      bgcolor: "#fff",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      color: theme.palette.text.primary,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    ₹/g
                  </Typography>
                </Box>
              ))}
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
                Updated: Today, 10:30 AM
              </Typography>
              {[
                "1 Carat (D-F, VVS)",
                "0.5 Carat (D-F, VVS)",
                "0.3 Carat (G-H, VS)",
              ].map((type) => (
                <Box key={type} sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
                    {type}
                  </Typography>
                  <InputBase
                    type="number"
                    value={diamondRates[type]}
                    onChange={handleDiamondRateChange(type)}
                    placeholder="Enter rate (/pc)"
                    sx={{
                      width: "100%",
                      p: 1,
                      mt: 1,
                      bgcolor: "#fff",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      color: theme.palette.text.primary,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    ₹/pc
                  </Typography>
                </Box>
              ))}
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
                    borderBottom: `2px solid ${theme.palette.secondary.main}`, // #DA9B48
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
                {
                  material: "Gold",
                  purity: "24k(999)",
                  rate: goldRates["24k(999)"] || "N/A",
                  unit: "₹/gm",
                },
                {
                  material: "Gold",
                  purity: "22k(916)",
                  rate: goldRates["22k(916)"] || "N/A",
                  unit: "₹/gm",
                },
                {
                  material: "Silver",
                  purity: "Pure Silver (999)",
                  rate: silverRates["Pure Silver (999)"] || "N/A",
                  unit: "₹/g",
                },
                {
                  material: "Silver",
                  purity: "Standard (925)",
                  rate: silverRates["Standard (925)"] || "N/A",
                  unit: "₹/g",
                },
                {
                  material: "Diamond",
                  purity: "1 Carat (D-F, VVS)",
                  rate: diamondRates["1 Carat (D-F, VVS)"] || "N/A",
                  unit: "₹/pc",
                },
                {
                  material: "Diamond",
                  purity: "0.5 Carat (D-F, VVS)",
                  rate: diamondRates["0.5 Carat (D-F, VVS)"] || "N/A",
                  unit: "₹/pc",
                },
                {
                  material: "Diamond",
                  purity: "0.3 Carat (G-H, VS)",
                  rate: diamondRates["0.3 Carat (G-H, VS)"] || "N/A",
                  unit: "₹/pc",
                },
              ].map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": {
                      bgcolor: "#f1e8d0",
                      transition: "all 0.3s ease",
                    },
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
    </Box>
  );
}

export default RatesManagement;
