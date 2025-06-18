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
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add, Close } from "@mui/icons-material";
import api from "../utils/api";

function CustomerManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [customerType, setCustomerType] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "Regular",
  });

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/getAllCustomers");
        setCustomers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setErrors({
          fetch: error.response?.data?.message || "Failed to fetch customers",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);
    const matchesType =
      customerType === "all" || customer.type === customerType;
    return matchesSearch && matchesType;
  });

  const validateForm = () => {
    const newErrors = {};
    if (!newCustomer.name.trim()) newErrors.name = "Name is required";
    if (!newCustomer.phone.trim()) newErrors.phone = "Phone is required";
    if (!newCustomer.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newCustomer.email))
      newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCustomer = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post("/AddCustomer", newCustomer);
      setCustomers([...customers, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error("Error adding customer:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to add customer",
      });
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "Regular",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
    setErrors({ ...errors, [name]: null, submit: null });
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleTypeChange = (e) => setCustomerType(e.target.value);

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
      {errors.fetch && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.fetch}
        </Alert>
      )}
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
            onClick={handleOpenModal}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
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

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <motion.div variants={modalVariants} initial="hidden" animate="visible">
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              p: 4,
              borderRadius: 2,
              boxShadow: theme.shadows[5],
              width: { xs: "90%", sm: 400 },
              position: "relative",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <Close />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: theme.palette.text.primary }}
            >
              Add New Customer
            </Typography>
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}
            <TextField
              label="Name"
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Phone"
              name="phone"
              value={newCustomer.phone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              value={newCustomer.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Address"
              name="address"
              value={newCustomer.address}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={newCustomer.type}
                onChange={handleInputChange}
                label="Type"
              >
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Wholesale">Wholesale</MenuItem>
                <MenuItem value="Retail">Retail</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                onClick={handleCloseModal}
                sx={{ color: theme.palette.text.secondary }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddCustomer}
                sx={{ bgcolor: theme.palette.primary.main }}
              >
                Add Customer
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Modal>

      {!loading && (
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
                      borderBottom: `2px solid ${theme.palette.secondary.main}`,
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
                      "&:hover": { transition: "all 0.3s ease" },
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
                          color: theme.palette.secondary.main,
                          borderColor: theme.palette.secondary.main,
                          "&:hover": {
                            bgcolor: "#e9c39b",
                            borderColor: "#c2833a",
                          },
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
      )}
    </Box>
  );
}

export default CustomerManagement;
