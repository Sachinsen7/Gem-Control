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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Search, Notifications } from "@mui/icons-material";

function Dashboard() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3 } },
  };

  const notificationVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  };

  // Mock data
  const stats = [
    { title: "Total Customers", value: 150, change: "+12%" },
    { title: "Total Sales", value: "$10,000", change: "+8%" },
    { title: "Stock Value", value: "$5,000", change: "+5%" },
    { title: "Today's Rates", value: "$100", change: "(Updated daily)" },
  ];

  const monthlySales = [
    { month: "May 2025", sales: "$8,500" },
    { month: "April 2025", sales: "$7,800" },
    { month: "March 2025", sales: "$7,200" },
  ];

  const recentActivities = [
    {
      date: "June 12, 2025 04:50 PM",
      activity: "New user registered",
      user: "John Doe",
    },
    {
      date: "June 12, 2025 04:40 PM",
      activity: "Sale completed",
      user: "Jane Smith",
    },
    {
      date: "June 12, 2025 04:30 PM",
      activity: "Stock updated",
      user: "Admin",
    },
  ];

  const notifications = [
    { id: 1, message: "New user registered", time: "04:50 PM" },
    { id: 2, message: "Sale completed", time: "04:40 PM" },
    { id: 3, message: "Stock updated", time: "04:30 PM" },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add search logic here if needed (e.g., filter stats or tables)
  };

  return (
    <div>
      {/* Top Section with Search and Notification */}
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
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
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Paper
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 300,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <IconButton sx={{ p: 1 }}>
              <Search sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }}
              placeholder="Search Dashboard..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <IconButton
            onClick={() => setNotificationOpen(!notificationOpen)}
            sx={{ ml: 2 }}
          >
            <Badge badgeContent={notifications.length} color="secondary">
              <Notifications sx={{ color: theme.palette.text.primary }} />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {notificationOpen && (
          <motion.div
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ position: "absolute", top: 80, right: 20, zIndex: 1000 }}
          >
            <Paper
              sx={{
                p: 1,
                maxWidth: 300,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                boxShadow: theme.shadows[4],
              }}
            >
              {notifications.map((notif) => (
                <Box key={notif.id} sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {notif.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {notif.time}
                  </Typography>
                  <Divider sx={{ my: 0.5 }} />
                </Box>
              ))}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <Grid container spacing={0} sx={{ width: "100%", p: 0 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} key={stat.title}>
            <motion.div
              custom={index}
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
                  color: theme.palette.text.primary,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  transition: "box-shadow 0.3s ease",
                  "&:hover": { boxShadow: theme.shadows[4] },
                  width: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.secondary, mb: 1 }}
                >
                  {stat.title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: theme.palette.primary.main, mb: 1 }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: stat.change.includes("-")
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                  }}
                >
                  {stat.change}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={0} sx={{ width: "100%", mt: 2, p: 0 }}>
        <Grid item xs={12} md={6}>
          <motion.div
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <TableContainer component={Paper} sx={{ width: "100%" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        width: "50%",
                      }}
                    >
                      Month
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        width: "50%",
                      }}
                    >
                      Sales
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlySales.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{ color: theme.palette.text.primary, width: "50%" }}
                      >
                        {row.month}
                      </TableCell>
                      <TableCell
                        sx={{ color: theme.palette.text.primary, width: "50%" }}
                      >
                        {row.sales}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <TableContainer component={Paper} sx={{ width: "100%" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        width: "33%",
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        width: "33%",
                      }}
                    >
                      Activity
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        width: "33%",
                      }}
                    >
                      User
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{ color: theme.palette.text.primary, width: "33%" }}
                      >
                        {row.date}
                      </TableCell>
                      <TableCell
                        sx={{ color: theme.palette.text.primary, width: "33%" }}
                      >
                        {row.activity}
                      </TableCell>
                      <TableCell
                        sx={{ color: theme.palette.text.primary, width: "33%" }}
                      >
                        {row.user}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;
