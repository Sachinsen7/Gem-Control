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
  InputBase, // Still needed for general search bar, even if activities are removed
  IconButton, // Still needed for general search bar
  Badge, // Still needed for notifications icon
  Box,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Search, Notifications } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import { toast } from "react-toastify";

function Dashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    totalSales: 0,
    totalStockValue: 0,
    totalRawMaterialWeight: 0,
  });
  const [todayRate, setTodayRate] = useState("N/A"); // Separated state for Today's Rate
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.3, ease: "easeOut" },
    },
  };

  const notificationVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch core dashboard summary data
      const dashboardResponse = await api.get("/getDashboardData");
      setDashboardStats({
        totalCustomers: dashboardResponse.data.totalCustomers || 0,
        totalSales: dashboardResponse.data.totalSales || 0,
        totalStockValue: dashboardResponse.data.totalStockValue || 0,
        totalRawMaterialWeight:
          dashboardResponse.data.totalRawMaterialWeight || 0,
      });

      // Fetch Today's Rate using its dedicated API
      try {
        const todayRateResponse = await api.get("/getTodayDailrate");
        setTodayRate(todayRateResponse.data.rate?.gold?.["24K"] || "N/A"); // Assuming structure is { rate: { gold: { "24K": ... } } }
      } catch (rateErr) {
        console.warn("Failed to fetch today's rate:", rateErr);
        setTodayRate("N/A"); // Set to N/A if today's rate is not found
      }

      // Fetch monthly sales data
      const monthlySalesResponse = await api.get("/getMonthlySalesData");
      const sortedMonthlySales = Array.isArray(monthlySalesResponse.data)
        ? monthlySalesResponse.data.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return (
              new Date(b.month + " 1, " + b.year).getTime() -
              new Date(a.month + " 1, " + a.year).getTime()
            );
          })
        : [];
      setMonthlySalesData(sortedMonthlySales);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to view dashboard data."
          : err.response?.data?.message || "Failed to load dashboard data.";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Mock notifications, as recent activities are removed for now
  const notifications = [
    { id: 1, message: "Welcome back!", time: "Just now" },
    { id: 2, message: "New feature updates coming soon!", time: "2 hours ago" },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Stats data for rendering
  const statsDisplay = [
    {
      title: "Total Customers",
      value: dashboardStats.totalCustomers.toLocaleString(),
      change: "",
    },
    {
      title: "Total Sales",
      value: `₹${dashboardStats.totalSales.toLocaleString()}`,
      change: "",
    },
    {
      title: "Stock Value",
      value: `₹${dashboardStats.totalStockValue.toLocaleString()}`,
      change: "",
    },
    {
      title: "Raw Material Weight",
      value: `${dashboardStats.totalRawMaterialWeight.toFixed(2)} kg`,
      change: "",
    },
    {
      title: "Today's Rate (24K Gold)",
      value: `₹${todayRate}`,
      change: "(Updated daily)",
    }, // Changed title to be specific
  ];

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 2, sm: 3 },
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Top Section with Search and Notification */}
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          width: "100%",
          gap: { xs: 2, sm: 0 },
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
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          Dashboard
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: "auto" }, // Adjust width for responsiveness
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            position: "relative",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Paper
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 300 },
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              mb: { xs: 1, sm: 0 },
            }}
          >
            <IconButton sx={{ p: 1 }}>
              <Search sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }}
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <IconButton
            onClick={() => setNotificationOpen(!notificationOpen)}
            sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 } }}
          >
            <Badge badgeContent={notifications.length} color="secondary">
              <Notifications sx={{ color: theme.palette.text.primary }} />
            </Badge>
          </IconButton>
          {/* Notification Dropdown */}
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                variants={notificationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  zIndex: 1000,
                  width: "250px",
                  marginTop: theme.spacing(1),
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    boxShadow: theme.shadows[6],
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <Box key={notif.id} sx={{ p: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            color: theme.palette.text.primary,
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: { xs: "0.6rem", sm: "0.7rem" },
                            display: "block",
                          }}
                        >
                          {notif.time}
                        </Typography>
                        <Divider sx={{ my: 0.5 }} />
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ p: 1, color: theme.palette.text.secondary }}
                    >
                      No new notifications.
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <>
          {/* Stats Grid */}
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}
          >
            {statsDisplay.map((stat, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={stat.title}>
                <motion.div
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 3 },
                      textAlign: "center",
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      transition: "all 0.3s ease",
                      "&:hover": { boxShadow: theme.shadows[8] },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 1,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: theme.palette.primary.main,
                        mb: 1,
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.change.includes("-")
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                        fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Monthly Sales Table */}
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}
          >
            <Grid item xs={12} md={6}>
              <motion.div
                variants={tableVariants}
                initial="hidden"
                animate="visible"
              >
                <Typography
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                    mb: 2,
                  }}
                >
                  Monthly Sales
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ width: "100%", borderRadius: 8, overflowX: "auto" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: "bold",
                            width: "50%",
                            bgcolor: theme.palette.background.paper,
                            borderBottom: `2px solid ${theme.palette.divider}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Month
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: "bold",
                            width: "50%",
                            bgcolor: theme.palette.background.paper,
                            borderBottom: `2px solid ${theme.palette.divider}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Sales
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlySalesData.length > 0 ? (
                        monthlySalesData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell
                              sx={{
                                color: theme.palette.text.primary,
                                width: "50%",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.month} {row.year}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: theme.palette.text.primary,
                                width: "50%",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              ₹{row.totalRevenue.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            sx={{
                              textAlign: "center",
                              color: theme.palette.text.secondary,
                            }}
                          >
                            No monthly sales data available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </motion.div>
            </Grid>

            {/* Recent Activities Panel (Removed for now) */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: "center",
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  boxShadow: theme.shadows[6],
                  height: "100%", // Maintain height visually
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 2,
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    fontWeight: "bold",
                  }}
                >
                  Recent Activities (Coming Soon)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    textAlign: "center",
                    maxWidth: "80%",
                  }}
                >
                  Activity logging features are under development and will be
                  available here soon.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
