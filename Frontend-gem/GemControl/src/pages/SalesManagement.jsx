import {
  Typography,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Add } from "@mui/icons-material";

function SalesManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [saleData, setSaleData] = useState({
    customer: "",
    saleDate: "",
    items: [{ name: "", quantity: 1, price: "" }],
    subtotal: 0,
    discount: 0,
    totalBeforeTax: 0,
    taxPercent: 3,
    taxAmount: 0,
    totalAmount: 0,
    paymentMethod: "Cash",
    amountReceived: "",
  });

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
  const sales = [
    {
      invoice: "INV001",
      date: "06/10/2025",
      customer: "John Doe",
      item: "Gold Ring",
      image: "https://via.placeholder.com/50",
      totalBaseCost: "12000",
      laborCost: "2000",
      tax: "360",
      discount: "500",
      totalAmount: "14860",
    },
    {
      invoice: "INV002",
      date: "06/11/2025",
      customer: "Jane Smith",
      item: "Silver Necklace",
      image: "https://via.placeholder.com/50",
      totalBaseCost: "4000",
      laborCost: "1000",
      tax: "150",
      discount: "200",
      totalAmount: "4950",
    },
    {
      invoice: "INV003",
      date: "06/12/2025",
      customer: "Mike Ross",
      item: "Platinum Bracelet",
      image: "https://via.placeholder.com/50",
      totalBaseCost: "20000",
      laborCost: "3000",
      tax: "690",
      discount: "1000",
      totalAmount: "22690",
    },
  ];

  const filteredSales = sales.filter(
    (sale) =>
      sale.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((fromDate === "" || new Date(sale.date) >= new Date(fromDate)) &&
        (toDate === "" || new Date(sale.date) <= new Date(toDate)))
  );

  const handleCreateSale = () => {
    setOpenCreateModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaleData((prev) => {
      const updatedData = { ...prev, [name]: value };
      // Recalculate totals
      const subtotal = prev.items.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity,
        0
      );
      const totalBeforeTax = subtotal - (parseFloat(updatedData.discount) || 0);
      const taxAmount =
        (totalBeforeTax * (parseFloat(updatedData.taxPercent) || 0)) / 100;
      const totalAmount = totalBeforeTax + taxAmount;
      return {
        ...updatedData,
        subtotal,
        totalBeforeTax,
        taxAmount,
        totalAmount,
      };
    });
  };

  const handleItemChange = (index, field, value) => {
    setSaleData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index][field] = value;
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity,
        0
      );
      const totalBeforeTax = subtotal - (parseFloat(prev.discount) || 0);
      const taxAmount =
        (totalBeforeTax * (parseFloat(prev.taxPercent) || 0)) / 100;
      const totalAmount = totalBeforeTax + taxAmount;
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        totalBeforeTax,
        taxAmount,
        totalAmount,
      };
    });
  };

  const addItem = () => {
    setSaleData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: "" }],
    }));
  };

  const handleSaveSale = () => {
    console.log("New Sale:", saleData);
    setOpenCreateModal(false);
    setSaleData({
      customer: "",
      saleDate: "",
      items: [{ name: "", quantity: 1, price: "" }],
      subtotal: 0,
      discount: 0,
      totalBeforeTax: 0,
      taxPercent: 3,
      taxAmount: 0,
      totalAmount: 0,
      paymentMethod: "Cash",
      amountReceived: "",
    });
  };

  const handleCancel = () => {
    setOpenCreateModal(false);
    setSaleData({
      customer: "",
      saleDate: "",
      items: [{ name: "", quantity: 1, price: "" }],
      subtotal: 0,
      discount: 0,
      totalBeforeTax: 0,
      taxPercent: 3,
      taxAmount: 0,
      totalAmount: 0,
      paymentMethod: "Cash",
      amountReceived: "",
    });
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
          Sales Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateSale}
            sx={{
              bgcolor: theme.palette.primary.main, // #C99314
              color: theme.palette.text.primary, // #A76E19
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Create Sale
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
              placeholder="Search sales..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
          <TextField
            type="text"
            placeholder="mm/dd/yyyy"
            value={fromDate}
            onChange={handleFromDateChange}
            sx={{
              width: 120,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1,
            }}
          />
          <Typography sx={{ color: theme.palette.text.primary }}>to</Typography>
          <TextField
            type="text"
            placeholder="mm/dd/yyyy"
            value={toDate}
            onChange={handleToDateChange}
            sx={{
              width: 120,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1,
            }}
          />
        </Box>
      </Box>

      {/* Sales Table */}
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
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Total Base Cost</TableCell>
                <TableCell>Labor Cost</TableCell>
                <TableCell>Tax</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow
                  key={sale.invoice}
                  sx={{
                    "&:hover": {
                      transition: "all 0.3s ease",
                    },
                    "& td": {
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.invoice}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.date}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.customer}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.item}
                  </TableCell>
                  <TableCell>
                    <img
                      src={sale.image}
                      alt={`${sale.item} image`}
                      style={{ width: 50, height: 50, borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.totalBaseCost}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.laborCost}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.tax}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.discount}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {sale.totalAmount}
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
          Page 1 of 8
        </Box>
      </motion.div>

      {/* Create Sale Modal */}
      <Dialog open={openCreateModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Create New Sale
        </DialogTitle>
        <DialogContent>
          <Select
            name="customer"
            value={saleData.customer}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
            displayEmpty
            renderValue={(value) => value || "Select Customer"}
          >
            <MenuItem value="" disabled>
              Select Customer
            </MenuItem>
            <MenuItem value="John Doe">John Doe</MenuItem>
            <MenuItem value="Jane Smith">Jane Smith</MenuItem>
            <MenuItem value="Mike Ross">Mike Ross</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="saleDate"
            label="Sale Date"
            type="text"
            fullWidth
            value={saleData.saleDate}
            onChange={handleInputChange}
            placeholder="mm/dd/yyyy"
            sx={{ mb: 2 }}
          />
          {saleData.items.map((item, index) => (
            <Box key={index} sx={{ mb: 2, display: "flex", gap: 2 }}>
              <TextField
                name="name"
                label="Item Name"
                type="text"
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
                sx={{ flex: 1 }}
              />
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                sx={{ width: 100 }}
              />
              <TextField
                name="price"
                label="Price (₹)"
                type="number"
                value={item.price}
                onChange={(e) =>
                  handleItemChange(index, "price", e.target.value)
                }
                sx={{ width: 150 }}
              />
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addItem}
            sx={{
              color: theme.palette.secondary.main,
              borderColor: theme.palette.secondary.main,
              "&:hover": { bgcolor: "#e9c39b", borderColor: "#c2833a" },
              mb: 2,
            }}
          >
            Add Item
          </Button>
          <Typography sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Subtotal: ₹{saleData.subtotal.toFixed(2)}
          </Typography>
          <TextField
            margin="dense"
            name="discount"
            label="Discount"
            type="number"
            fullWidth
            value={saleData.discount}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Typography sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Total Before Tax: ₹{saleData.totalBeforeTax.toFixed(2)}
          </Typography>
          <TextField
            margin="dense"
            name="taxPercent"
            label="Tax (%)"
            type="number"
            fullWidth
            value={saleData.taxPercent}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Typography sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Tax Amount: ₹{saleData.taxAmount.toFixed(2)}
          </Typography>
          <Typography sx={{ color: theme.palette.text.primary, mb: 1 }}>
            Total Amount: ₹{saleData.totalAmount.toFixed(2)}
          </Typography>
          <Select
            name="paymentMethod"
            value={saleData.paymentMethod}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            <MenuItem value="Udhar (Credit)">Udhar (Credit)</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="amountReceived"
            label="Amount Received"
            type="number"
            fullWidth
            value={saleData.amountReceived}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSale}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Save Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SalesManagement;
