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
      date: "June 12, 2025 05:50 PM",
      activity: "New user registered",
      user: "John Doe",
    },
    {
      date: "June 12, 2025 05:40 PM",
      activity: "Sale completed",
      user: "Jane Smith",
    },
    {
      date: "June 12, 2025 05:30 PM",
      activity: "Stock updated",
      user: "Admin",
    },
    {
      date: "June 12, 2025 05:20 PM",
      activity: "Payment received",
      user: "Mike Ross",
    },
  ];

  const notifications = [
    { id: 1, message: "New user registered", time: "05:50 PM" },
    { id: 2, message: "Sale completed", time: "05:40 PM" },
    { id: 3, message: "Stock updated", time: "05:30 PM" },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 2, sm: 3 }, // Adjusted padding for mobile
      }}
    >
      {/* Top Section with Search and Notification */}
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack on mobile
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          width: "100%",
          gap: { xs: 2, sm: 0 }, // Add gap on mobile
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
            fontSize: { xs: "1.5rem", sm: "2rem" }, // Smaller on mobile
          }}
        >
          Dashboard
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: { xs: "flex-start", sm: "flex-end" },
          }}
        >
          <Paper
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 300 },
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              mb: { xs: 1, sm: 0 }, // Margin bottom on mobile
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
            sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 } }} // Adjust margin on mobile
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
            style={{
              position: "absolute",
              top: { xs: 70, sm: 80 },
              right: { xs: 10, sm: 20 },
              zIndex: 1000,
            }}
          >
            <Paper
              sx={{
                p: 1,
                maxWidth: { xs: 250, sm: 300 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: theme.shadows[6],
              }}
            >
              {notifications.map((notif) => (
                <Box key={notif.id} sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
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
                    }}
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
      <Grid
        container
        spacing={2}
        sx={{ width: "100%", mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}
      >
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
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

      {/* Tables Section */}
      <Grid
        container
        spacing={2}
        sx={{ width: "100%", mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}
      >
        {/* Monthly Sales Table */}
        <Grid item xs={12}>
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
              sx={{ width: "100%", borderRadius: 8, overflowX: "auto" }} // Added horizontal scroll for mobile
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
                        whiteSpace: "nowrap", // Prevent text wrapping
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
                  {monthlySales.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          width: "50%",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.month}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          width: "50%",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          whiteSpace: "nowrap",
                        }}
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

        {/* Recent Activities as Scrollable Notifications Panel */}
        <Grid item xs={12}>
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
              Recent Activities
            </Typography>
            <Paper
              sx={{
                width: "100%",
                maxHeight: { xs: 200, sm: 300 }, // Smaller height on mobile
                overflowY: "auto",
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                "&::-webkit-scrollbar": { width: "6px", height: "6px" }, // Adjusted for mobile
                "&::-webkit-scrollbar-track": {
                  background: theme.palette.background.paper,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 4,
                },
              }}
            >
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: { xs: 1, sm: 2 },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    "&:last-child": { borderBottom: "none" },
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      bgcolor: theme.palette.background.paper,
                      boxShadow: theme.shadows[2],
                    },
                  }}
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      fontSize: { xs: "0.8rem", sm: "1rem" },
                    }}
                  >
                    {activity.activity}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: { xs: "0.6rem", sm: "0.8rem" },
                      display: "block",
                    }}
                  >
                    {activity.date} by {activity.user}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
