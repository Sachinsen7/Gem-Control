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
import { useState, useEffect, useCallback } from "react";
import { Search, Add, Close } from "@mui/icons-material";
import api from "../utils/api";

function CustomerManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [customerType, setCustomerType] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    firm: "",
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

  const fetchData = async () => {
    try {
      const [customerResponse, firmResponse] = await Promise.all([
        api.get("/getAllCustomers"),
        api.get("/getAllFirms"),
      ]);
      setCustomers(
        Array.isArray(customerResponse.data) ? customerResponse.data : []
      );
      setFirms(Array.isArray(firmResponse.data) ? firmResponse.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrors({
        fetch: error.response?.data?.message || "Failed to fetch data",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contact?.includes(searchQuery);
    return matchesSearch;
  });

  const validateForm = () => {
    const newErrors = {};
    if (!newCustomer.name.trim()) newErrors.name = "Name is required";
    if (!newCustomer.contact.trim()) newErrors.contact = "Contact is required";
    if (!newCustomer.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newCustomer.email))
      newErrors.email = "Invalid email format";
    if (!newCustomer.firm) newErrors.firm = "Firm is required";
    if (!newCustomer.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCustomer = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post("/AddCustomer", newCustomer);
      await fetchData(); 
      handleCloseModal();
    } catch (error) {
      console.error("Error adding customer:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to add customer",
      });
    }
  }, [validateForm, fetchData]);

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewCustomer({
      name: "",
      contact: "",
      email: "",
      address: "",
      firm: "",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
    setErrors({ ...errors, [name]: null, submit: null });
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

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
      {errors.fetch && (
        <Alert
          severity="error"
          sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
        >
          {errors.fetch}
        </Alert>
      )}
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
          Customer Management
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" }, 
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenModal}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" }, 
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Add Customer
          </Button>
          <Paper
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 200, md: 300 }, 
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconButton sx={{ p: { xs: 0.5, sm: 1 } }}>
              <Search
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                }}
              />
            </IconButton>
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                color: theme.palette.text.primary,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
              placeholder="Search customers..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
        </Box>
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div variants={modalVariants} initial="hidden" animate="visible">
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
              boxShadow: theme.shadows[5],
              width: { xs: "90%", sm: 400, md: 500 }, 
              position: "relative",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                p: { xs: 0.5, sm: 1 },
              }}
            >
              <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 2, sm: 3 },
                color: theme.palette.text.primary,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Add New Customer
            </Typography>
            {errors.submit && (
              <Alert
                severity="error"
                sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
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
              sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            />
            <TextField
              label="Contact"
              name="contact"
              value={newCustomer.contact}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.contact}
              helperText={errors.contact}
              sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
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
              sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            />
            <TextField
              label="Address"
              name="address"
              value={newCustomer.address}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              error={!!errors.address}
              helperText={errors.address}
              sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            />
            <FormControl
              fullWidth
              sx={{ mb: { xs: 1, sm: 2 } }}
              error={!!errors.firm}
            >
              <InputLabel sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                Firm
              </InputLabel>
              <Select
                name="firm"
                value={newCustomer.firm}
                onChange={handleInputChange}
                label="Firm"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                {firms.map((firm) => (
                  <MenuItem
                    key={firm._id}
                    value={firm._id}
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                  >
                    {firm.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.firm && (
                <Typography
                  color="error"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
                >
                  {errors.firm}
                </Typography>
              )}
            </FormControl>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: { xs: 1, sm: 2 },
                flexDirection: { xs: "column", sm: "row" }, 
              }}
            >
              <Button
                onClick={handleCloseModal}
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddCustomer}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  width: { xs: "100%", sm: "auto" },
                }}
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
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Address
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Firm
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{
                        textAlign: "center",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    >
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer._id}
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
                        {customer.name}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {customer.contact}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        {customer.email}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        {customer.address}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: theme.palette.text.primary,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        {customer.firm?.name || "N/A"}
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
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            px: { xs: 0.5, sm: 1 },
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              mt: 2,
              textAlign: "center",
              color: theme.palette.text.secondary,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
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