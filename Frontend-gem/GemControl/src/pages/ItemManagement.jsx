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

function ItemManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [metalFilter, setMetalFilter] = useState("all");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Rings",
    metalType: "Gold",
    metalPurity: "24K (999)",
    metalWeight: "",
    makingCost: "",
    totalCost: "",
    stoneDetails:
      '[{"type": "diamond", "carat": 0.5, "quantity": 2, "quality": "VS"}]',
    stockQuantity: "",
    tagCode: "",
    image: null,
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
  const items = [
    {
      id: 1,
      image: "https://via.placeholder.com/50",
      name: "Gold Ring",
      category: "Rings",
      metalType: "Gold",
      metalWeight: "5g",
      makingCost: "2000",
      stock: "10",
      price: "15000",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/50",
      name: "Silver Necklace",
      category: "Necklaces",
      metalType: "Silver",
      metalWeight: "20g",
      makingCost: "1000",
      stock: "15",
      price: "5000",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/50",
      name: "Platinum Bracelet",
      category: "Bracelets",
      metalType: "Platinum",
      metalWeight: "10g",
      makingCost: "3000",
      stock: "5",
      price: "25000",
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (metalFilter === "all" || item.metalType === metalFilter)
  );

  const handleAddItem = () => {
    setOpenAddModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleMetalChange = (e) => {
    setMetalFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewItem({ ...newItem, image: e.target.files[0] });
  };

  const handleSaveItem = () => {
    console.log("New Item:", newItem);
    setOpenAddModal(false);
    setNewItem({
      name: "",
      category: "Rings",
      metalType: "Gold",
      metalPurity: "24K (999)",
      metalWeight: "",
      makingCost: "",
      totalCost: "",
      stoneDetails:
        '[{"type": "diamond", "carat": 0.5, "quantity": 2, "quality": "VS"}]',
      stockQuantity: "",
      tagCode: "",
      image: null,
    });
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewItem({
      name: "",
      category: "Rings",
      metalType: "Gold",
      metalPurity: "24K (999)",
      metalWeight: "",
      makingCost: "",
      totalCost: "",
      stoneDetails:
        '[{"type": "diamond", "carat": 0.5, "quantity": 2, "quality": "VS"}]',
      stockQuantity: "",
      tagCode: "",
      image: null,
    });
  };

  // Metal purity options based on metal type
  const getPurityOptions = (metalType) => {
    const purityOptions = {
      Gold: ["24K (999)", "22K (916)", "18K (750)", "14K (585)"],
      Silver: ["925 Silver", "999 Silver"],
      Platinum: ["950 Platinum"],
    };
    return purityOptions[metalType] || [];
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
          Items Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddItem}
            sx={{
              bgcolor: theme.palette.primary.main, // #C99314
              color: theme.palette.text.primary, // #A76E19
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Add Item
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
              placeholder="Search items..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={categoryFilter}
            onChange={handleCategoryChange}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="Rings">Rings</MenuItem>
            <MenuItem value="Necklaces">Necklaces</MenuItem>
            <MenuItem value="Bracelets">Bracelets</MenuItem>
            <MenuItem value="Earrings">Earrings</MenuItem>
            <MenuItem value="Bangles">Bangles</MenuItem>
            <MenuItem value="Pendants">Pendants</MenuItem>
          </Select>
          <Select
            value={metalFilter}
            onChange={handleMetalChange}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Metals</MenuItem>
            <MenuItem value="Gold">Gold</MenuItem>
            <MenuItem value="Silver">Silver</MenuItem>
            <MenuItem value="Platinum">Platinum</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Items Table */}
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
                <TableCell>Image</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Metal Type</TableCell>
                <TableCell>Metal Weight</TableCell>
                <TableCell>Making Cost</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
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
                    {item.id}
                  </TableCell>
                  <TableCell>
                    <img
                      src={item.image}
                      alt={`${item.name} image`}
                      style={{ width: 50, height: 50, borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {item.name}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {item.category}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {item.metalType}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {item.metalWeight}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {item.makingCost}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {item.stock}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {item.price}
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
          Page 1
        </Box>
      </motion.div>

      {/* Add Item Modal */}
      <Dialog open={openAddModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Add New Item
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Item Name"
            type="text"
            fullWidth
            value={newItem.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Select
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Rings">Rings</MenuItem>
            <MenuItem value="Necklaces">Necklaces</MenuItem>
            <MenuItem value="Bracelets">Bracelets</MenuItem>
            <MenuItem value="Earrings">Earrings</MenuItem>
            <MenuItem value="Bangles">Bangles</MenuItem>
            <MenuItem value="Pendants">Pendants</MenuItem>
          </Select>
          <Select
            name="metalType"
            value={newItem.metalType}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Gold">Gold</MenuItem>
            <MenuItem value="Silver">Silver</MenuItem>
            <MenuItem value="Platinum">Platinum</MenuItem>
          </Select>
          <Select
            name="metalPurity"
            value={newItem.metalPurity}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            {getPurityOptions(newItem.metalType).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <TextField
            margin="dense"
            name="metalWeight"
            label="Metal Weight (g)"
            type="number"
            fullWidth
            value={newItem.metalWeight}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="makingCost"
            label="Making Cost (₹)"
            type="number"
            fullWidth
            value={newItem.makingCost}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="totalCost"
            label="Total Cost (₹)"
            type="number"
            fullWidth
            value={newItem.totalCost}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="stoneDetails"
            label="Stone Details (JSON)"
            type="text"
            fullWidth
            value={newItem.stoneDetails}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            placeholder='[{"type": "diamond", "carat": 0.5, "quantity": 2, "quality": "VS"}]'
          />
          <TextField
            margin="dense"
            name="stockQuantity"
            label="Stock Quantity"
            type="number"
            fullWidth
            value={newItem.stockQuantity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="tagCode"
            label="Tag Code"
            type="text"
            fullWidth
            value={newItem.tagCode}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            component="label"
            sx={{
              bgcolor: theme.palette.secondary.main, // #DA9B48
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#c2833a" },
              mb: 2,
            }}
          >
            Upload Image
            <input
              type="file"
              hidden
              name="image"
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            {newItem.image ? newItem.image.name : "No file chosen"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main, // #C99314
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Save Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Metal purity options based on metal type
function getPurityOptions(metalType) {
  const purityOptions = {
    Gold: ["24K (999)", "22K (916)", "18K (750)", "14K (585)"],
    Silver: ["925 Silver", "999 Silver"],
    Platinum: ["950 Platinum"],
  };
  return purityOptions[metalType] || [];
}

export default ItemManagement;
