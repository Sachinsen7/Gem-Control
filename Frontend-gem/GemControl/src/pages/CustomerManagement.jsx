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
  Button,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Add } from "@mui/icons-material";

function CustomerManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [customerType, setCustomerType] = useState("all");

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.3, ease: "easeOut" },
    },
  };

  // Mock data
  const customers = [
    {
      id: 1,
      name: "John Doe",
      phone: "1234567890",
      email: "john@example.com",
      address: "123 Main St",
      type: "Regular",
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "9876543210",
      email: "jane@example.com",
      address: "456 Oak Ave",
      type: "Wholesale",
    },
    {
      id: 3,
      name: "Mike Ross",
      phone: "5555555555",
      email: "mike@example.com",
      address: "789 Pine Rd",
      type: "Retail",
    },
    {
      id: 4,
      name: "Sarah Lee",
      phone: "1111111111",
      email: "sarah@example.com",
      address: "321 Elm St",
      type: "Regular",
    },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesType =
      customerType === "all" || customer.type === customerType;
    return matchesSearch && matchesType;
  });

  const handleAddCustomer = () => {
    alert("Add Customer functionality to be implemented!");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeChange = (e) => {
    setCustomerType(e.target.value);
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
          Customer Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCustomer}
            sx={{
              bgcolor: theme.palette.primary.main, // #C99314
              color: theme.palette.text.primary, // #A76E19
              "&:hover": { bgcolor: "#b5830f" }, // Slightly darker shade
              borderRadius: 2,
            }}
          >
            Add Customer
          </Button>
          <Paper
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              width: { xs: 200, sm: 300 },
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconButton sx={{ p: 1 }}>
              <Search sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }}
              placeholder="Search customers..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={customerType}
            onChange={handleTypeChange}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="Regular">Regular</MenuItem>
            <MenuItem value="Wholesale">Wholesale</MenuItem>
            <MenuItem value="Retail">Retail</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Customer Table */}
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
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "#f1e8d0", // Light variant of #D9CA9A
                      transition: "all 0.3s ease",
                    },
                    "& td": {
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {customer.id}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {customer.name}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {customer.phone}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {customer.email}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {customer.address}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: theme.palette.secondary.main, // #DA9B48
                        borderColor: theme.palette.secondary.main,
                        "&:hover": {
                          bgcolor: "#e9c39b",
                          borderColor: "#c2833a",
                        }, // Light tan background
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            mt: 2,
            textAlign: "center",
            color: theme.palette.text.secondary,
          }}
        >
          Page 1 of 1
        </Box>
      </motion.div>
    </Box>
  );
}

export default CustomerManagement;
