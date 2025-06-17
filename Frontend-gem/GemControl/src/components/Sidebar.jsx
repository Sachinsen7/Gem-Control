import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dashboard,
  People,
  Business,
  RateReview,
  ShoppingCart,
  Category,
  Inventory,
  PointOfSale,
  Payment,
  AccountBalance,
} from "@mui/icons-material";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Collapse,
  GlobalStyles,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "../utils/routes";

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: ROUTES.DASHBOARD },
  { text: "User Management", icon: <People />, path: ROUTES.USER_MANAGEMENT },
  { text: "Firm Management", icon: <Business />, path: ROUTES.FIRM_MANAGEMENT },
  {
    text: "Rates Management",
    icon: <RateReview />,
    path: ROUTES.RATES_MANAGEMENT,
  },
  {
    text: "Customer Management",
    icon: <People />,
    path: ROUTES.CUSTOMER_MANAGEMENT,
  },
  { text: "Raw Materials", icon: <Inventory />, path: ROUTES.RAW_MATERIALS },
  { text: "Categories", icon: <Category />, path: ROUTES.CATEGORIES },
  {
    text: "Items Management",
    icon: <Inventory />,
    path: ROUTES.ITEMS_MANAGEMENT,
  },
  {
    text: "Sales Management",
    icon: <PointOfSale />,
    path: ROUTES.SALES_MANAGEMENT,
  },
  { text: "Payments", icon: <Payment />, path: ROUTES.PAYMENTS },
  {
    text: "Udhar Management",
    icon: <AccountBalance />,
    path: ROUTES.UDHAR_MANAGEMENT,
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <GlobalStyles
        styles={{
          "::-webkit-scrollbar": {
            width: "6px",
            backgroundColor: theme.palette.background.paper,
          },
          "::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.primary.main,
            borderRadius: "4px",
          },
        }}
      />
      <Drawer
        variant="permanent"
        sx={{
          width: { xs: 60, sm: 240 }, // Collapsed on mobile, expanded on larger screens
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: 60, sm: 240 },
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: "width 0.3s ease",
            overflowX: "hidden", // Prevent horizontal overflow on mobile
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 2 },
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            fontWeight={600}
            sx={{ display: { xs: "none", sm: "block" } }} // Hide on mobile
          >
            ADRS Gem Control
          </Typography>
        </Box>
        <List>
          <AnimatePresence>
            {open &&
              menuItems.map((item, index) => (
                <motion.div
                  key={item.text}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  whileHover="hover" // <-- Move here
                >
                  <ListItem
                    component="button"
                    onClick={() => navigate(item.path)}
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      mb: 0.5,
                      cursor: "pointer",
                      borderRadius: 1,
                      bgcolor: isActive(item.path)
                        ? theme.palette.primary.main
                        : "transparent",
                      color: isActive(item.path)
                        ? theme.palette.text.primary
                        : theme.palette.text.secondary,
                      "&:hover": {
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.text.primary,
                      },
                      transition: "background-color 0.3s ease, color 0.3s ease",
                      minHeight: { xs: 48, sm: 56 }, // Adjusted height for mobile
                      justifyContent: { xs: "center", sm: "flex-start" }, // Center on mobile
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 0, sm: 40 },
                        color: isActive(item.path)
                          ? theme.palette.text.primary
                          : theme.palette.text.secondary,
                        "&:hover": { color: theme.palette.text.primary },
                        justifyContent: "center", // Center icon on mobile
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        "& .MuiTypography-root": {
                          fontWeight: isActive(item.path) ? "bold" : "normal",
                          display: { xs: "none", sm: "block" }, // Hide text on mobile
                        },
                      }}
                    />
                  </ListItem>
                </motion.div>
              ))}
          </AnimatePresence>
        </List>
      </Drawer>
    </>
  );
}

export default Sidebar;
