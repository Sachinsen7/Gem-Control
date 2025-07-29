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
  IconButton,
  Badge,
  Box,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Notifications } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import NotificationModal from "../components/NotificationModal";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// fuction starts
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
  const [todayRates, setTodayRates] = useState({
    gold24K: "N/A",
    silver: "N/A",
    diamond1Carat: "N/A",
  });
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [recentActivitiesData, setRecentActivitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const notificationRef = useRef(null);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
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
      const [
        dashboardResponse,
        todayRateResponse,
        monthlySalesResponse,
        recentActivitiesResponse,
      ] = await Promise.all([
        api.get("/getDashboardData"),
        api.get("/getTodayDailrate"),
        api.get("/getMonthlySalesData"),
        api.get("/getRecentActivities"),
      ]);

      setDashboardStats({
        totalCustomers: dashboardResponse.data.totalCustomers || 0,
        totalSales: dashboardResponse.data.totalSales || 0,
        totalStockValue: dashboardResponse.data.totalStockValue || 0,
        totalRawMaterialWeight: dashboardResponse.data.totalRawMaterialWeight || 0,
      });

      setTodayRates({
        gold24K: todayRateResponse.data.rate?.gold?.["24K"] || "N/A",
        silver: todayRateResponse.data.rate?.silver || "N/A",
        diamond1Carat: todayRateResponse.data.rate?.daimond?.["1 Carat"] || "N/A",
      });

      const sortedMonthlySales = Array.isArray(monthlySalesResponse.data)
        ? monthlySalesResponse.data.sort((a, b) => {
            const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            if (a.year !== b.year) return a.year - b.year;
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
          })
        : [];
      setMonthlySalesData(sortedMonthlySales);

      setRecentActivitiesData(Array.isArray(recentActivitiesResponse.data) ? recentActivitiesResponse.data : []);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to view dashboard data."
          : err.response?.data?.message || "Failed to load dashboard data.";
      setError(errorMessage);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationOpen && notificationRef.current && !notificationRef.current.contains(event.target) &&
          !event.target.closest('.MuiIconButton-root[aria-label="notifications"]')) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationOpen]);

  const notifications = recentActivitiesData.map((activity) => ({
    id: activity._id,
    message: `${activity.activityType}: ${activity.description}`,
    time: new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })).slice(0, 5);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredActivities = recentActivitiesData.filter(
    (activity) =>
      (activity.activityType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statsDisplay = [
    { title: "Total Customers", value: dashboardStats.totalCustomers.toLocaleString(), change: "" },
    { title: "Total Sales", value: `₹${dashboardStats.totalSales.toLocaleString()}`, change: "" },
    { title: "Stock Value", value: `₹${dashboardStats.totalStockValue.toLocaleString()}`, change: "" },
    { title: "Raw Material Weight", value: `${dashboardStats.totalRawMaterialWeight.toFixed(2)} kg`, change: "" },
    { title: "Today's Gold (24K)", value: `₹${todayRates.gold24K}`, change: "(Updated daily)" },
    { title: "Today's Silver", value: `₹${todayRates.silver}`, change: "(Updated daily)" },
    { title: "Today's Diamond (1 Carat)", value: `₹${todayRates.diamond1Carat}`, change: "(Updated daily)" },
  ];

  const handleNotificationClose = () => {
    // This function is still needed if you decide to use NotificationModal for global errors
    // setNotificationDialog({ ...notificationDialog, open: false });
    // If you don't use NotificationModal for global errors, this function might become unused.
  };

  // Data for the comparison chart of current totals
  const summaryComparisonData = [
    { name: 'Customers', value: dashboardStats.totalCustomers },
    { name: 'Sales', value: dashboardStats.totalSales },
    { name: 'Stock Value', value: dashboardStats.totalStockValue },
    { name: 'Raw Material (kg)', value: dashboardStats.totalRawMaterialWeight },
  ];

  // Data for the historical rates chart
  const historicalRatesData = monthlySalesData.map(d => ({
    date: `${d.month.slice(0,3)} ${d.year}`,
    gold: parseFloat(todayRates.gold24K) || 0,
    silver: parseFloat(todayRates.silver) || 0, 
    diamond: parseFloat(todayRates.diamond1Carat) || 0,
  }));


  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        px: { xs: theme.spacing(1), sm: theme.spacing(2), md: theme.spacing(3) },
        pt: { xs: theme.spacing(2), sm: theme.spacing(3) },
        pb: { xs: theme.spacing(2), sm: theme.spacing(3) },
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{ mb: theme.spacing(2), fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Top Section with Search and Notification */}
      <Box
        sx={{
          p: { xs: theme.spacing(1), sm: theme.spacing(2) },
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius * 2,
          mb: { xs: theme.spacing(2), sm: theme.spacing(4) },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          width: "100%",
          gap: { xs: theme.spacing(2), sm: theme.spacing(2) },
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
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            position: "relative",
            gap: { xs: theme.spacing(1), sm: theme.spacing(2) },
          }}
        >
          <Paper
            sx={{
              p: { xs: theme.spacing(0.5), sm: theme.spacing(1) },
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 300 },
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1],
            }}
          >
            <IconButton sx={{ p: theme.spacing(1) }}>
              <Search sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
            <InputBase
              sx={{ ml: theme.spacing(1), flex: 1, color: theme.palette.text.primary }}
              placeholder="Search Activities..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <IconButton
            onClick={() => setNotificationOpen(!notificationOpen)}
            sx={{ ml: { xs: 0, sm: theme.spacing(1) }, mt: { xs: theme.spacing(1), sm: 0 } }}
            aria-label="notifications"
          >
            <Badge badgeContent={notifications.length} color="secondary">
              <Notifications sx={{ color: theme.palette.text.primary }} />
            </Badge>
          </IconButton>
          {/* Notification Dropdown */}
          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                ref={notificationRef}
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
                    p: theme.spacing(1),
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[6],
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <Box key={notif.id} sx={{ p: theme.spacing(1) }}>
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
                        <Divider sx={{ my: theme.spacing(0.5) }} />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ p: theme.spacing(1), color: theme.palette.text.secondary }}>
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
        <Box sx={{ display: "flex", justifyContent: "center", py: theme.spacing(4) }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <>
          {/* Stats Grid */}
          <Grid
            container
            spacing={theme.spacing(2)}
            sx={{ width: "100%", mt: { xs: theme.spacing(2), sm: theme.spacing(4) }, px: { xs: theme.spacing(1), sm: theme.spacing(2) } }}
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
                      p: { xs: theme.spacing(2), sm: theme.spacing(3) },
                      textAlign: "center",
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius * 2,
                      transition: "all 0.3s ease",
                      "&:hover": { boxShadow: theme.shadows[8] },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.text.secondary,
                          mb: theme.spacing(1),
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: theme.palette.primary.main,
                          mb: theme.spacing(1),
                          fontSize: { xs: "1.2rem", sm: "1.5rem" },
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.change.includes("-")
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                        fontSize: { xs: "0.7rem", sm: "0.8rem" },
                        mt: 'auto',
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Charts Section */}
          <Grid
            container
            spacing={theme.spacing(2)}
            sx={{ width: "100%", mt: { xs: theme.spacing(2), sm: theme.spacing(4) }, px: { xs: theme.spacing(1), sm: theme.spacing(2) } }}
          >
            {/* Monthly Sales Chart (Bar Chart) */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: theme.spacing(2), borderRadius: theme.shape.borderRadius * 2, boxShadow: theme.shadows[4], height: 400 }}>
                <Typography variant="h6" sx={{ mb: theme.spacing(2), textAlign: 'center', color: theme.palette.text.primary }}>
                  Monthly Sales Revenue
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart
                    data={monthlySalesData.map(d => ({ ...d, name: `${d.month} ${d.year}` }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius }}
                      itemStyle={{ color: theme.palette.text.primary }}
                      labelStyle={{ color: theme.palette.text.secondary }}
                    />
                    <Legend />
                    <Bar dataKey="totalRevenue" name="Total Revenue" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Comparison Chart for Totals (Bar Chart) */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: theme.spacing(2), borderRadius: theme.shape.borderRadius * 2, boxShadow: theme.shadows[4], height: 400 }}>
                <Typography variant="h6" sx={{ mb: theme.spacing(2), textAlign: 'center', color: theme.palette.text.primary }}>
                  Overall Metrics Comparison
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart
                    data={summaryComparisonData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                      contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius }}
                      itemStyle={{ color: theme.palette.text.primary }}
                      labelStyle={{ color: theme.palette.text.secondary }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Amount/Count" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Historical Rates Chart (Line Chart) */}
            <Grid item xs={12} md={12}>
              <Paper sx={{ p: theme.spacing(2), borderRadius: theme.shape.borderRadius * 2, boxShadow: theme.shadows[4], height: 400 }}>
                <Typography variant="h6" sx={{ mb: theme.spacing(2), textAlign: 'center', color: theme.palette.text.primary }}>
                  Last 5 Months Rates Trend
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart
                    data={historicalRatesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: theme.shape.borderRadius }}
                      itemStyle={{ color: theme.palette.text.primary }}
                      labelStyle={{ color: theme.palette.text.secondary }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="gold" stroke={theme.palette.primary.main} name="Gold (24K)" />
                    <Line type="monotone" dataKey="silver" stroke={theme.palette.secondary.main} name="Silver" />
                    <Line type="monotone" dataKey="diamond" stroke={theme.palette.error.main} name="Diamond (1 Carat)" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
 