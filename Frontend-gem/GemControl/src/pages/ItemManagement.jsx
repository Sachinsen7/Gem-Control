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
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Search, Add, Delete, Print as PrintIcon } from "@mui/icons-material"; // Import PrintIcon
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api, { BASE_URL } from "../utils/api";
import JsBarcode from "jsbarcode";
import { toast } from "react-toastify"; // Ensure toast is imported

function ItemManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [metalFilter, setMetalFilter] = useState("all");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [newItem, setNewItem] = useState({
    name: "",
    materialgitType: "gold",
    waight: "",
    category: "",
    firm: "",
    quantity: "",
    price: "",
    makingCharge: "",
    stockImg: null,
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

  // Removed the useEffect that generated barcodes on component load
  // Barcodes will now only be generated when the print button is clicked.

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockResponse, categoryResponse, firmResponse] = await Promise.all(
        [
          api.get("/getAllStocks"),
          api.get("/getAllStockCategories"),
          api.get("/getAllFirms"),
        ]
      );
      setStocks(Array.isArray(stockResponse.data) ? stockResponse.data : []);
      setCategories(
        Array.isArray(categoryResponse.data) ? categoryResponse.data : []
      );
      setFirms(Array.isArray(firmResponse.data) ? firmResponse.data : []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to view items."
          : err.response?.data?.message || "Failed to load data.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!newItem.name.trim()) errors.name = "Item name is required";
    if (!newItem.materialgitType)
      errors.materialgitType = "Material type is required";
    if (!newItem.waight || isNaN(newItem.waight) || newItem.waight <= 0)
      errors.waight = "Valid weight is required";
    if (!newItem.category) errors.category = "Category is required";
    if (!newItem.firm) errors.firm = "Firm is required";
    if (!newItem.quantity || isNaN(newItem.quantity) || newItem.quantity <= 0)
      errors.quantity = "Valid quantity is required";
    if (!newItem.price || isNaN(newItem.price) || newItem.price <= 0)
      errors.price = "Valid price is required";
    if (
      !newItem.makingCharge ||
      isNaN(newItem.makingCharge) ||
      newItem.makingCharge < 0
    )
      errors.makingCharge = "Valid making charge is required";
    if (!newItem.stockImg) errors.stockImg = "Image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateStockCode = () => {
    // You might want to make this more robust and unique.
    // For production, consider using UUIDs or backend-generated unique IDs.
    // This current method might generate very long base64 strings.
    const category = categories.find((cat) => cat._id === newItem.category);
    const firm = firms.find((f) => f._id === newItem.firm);
    const stockData = {
      name: newItem.name,
      materialgitType: newItem.materialgitType,
      waight: parseFloat(newItem.waight) || 0,
      category: { id: newItem.category, name: category?.name || "" },
      firm: { id: newItem.firm, name: firm?.name || "" },
      quantity: parseInt(newItem.quantity) || 0,
      price: parseFloat(newItem.price) || 0,
      makingCharge: parseFloat(newItem.makingCharge) || 0,
      totalValue:
        (parseFloat(newItem.price) || 0) +
        (parseFloat(newItem.makingCharge) || 0),
      timestamp: Date.now(),
    };
    // A simple, unique code for barcode might be better:
    // e.g., `STOCK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    // Or even better, let the backend generate the stockcode and return it.
    return `STOCK-${btoa(JSON.stringify(stockData))}`;
  };

  const handleAddItem = () => {
    if (!currentUser) {
      setError("Please log in to add items.");
      dispatch(setAuthError("Please log in to add items."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setOpenAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null, submit: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem((prev) => ({ ...prev, stockImg: file }));
      setFormErrors((prev) => ({ ...prev, stockImg: null, submit: null }));
    }
  };

  const handleSaveItem = async () => {
    if (!validateForm()) return;

    try {
      const stockcode = generateStockCode(); // Generate stockcode before sending
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("materialgitType", newItem.materialgitType);
      formData.append("waight", newItem.waight);
      formData.append("category", newItem.category);
      formData.append("firm", newItem.firm);
      formData.append("quantity", newItem.quantity);
      formData.append("price", newItem.price);
      formData.append("makingCharge", newItem.makingCharge);
      formData.append("stockcode", stockcode); // Append the generated stockcode
      if (newItem.stockImg) formData.append("stock", newItem.stockImg);

      const response = await api.post("/Addstock", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStocks((prev) => [...prev, response.data.stock]); // Add the new item to state
      setOpenAddModal(false);
      setNewItem({
        name: "",
        materialgitType: "gold",
        waight: "",
        category: "",
        firm: "",
        quantity: "",
        price: "",
        makingCharge: "",
        stockImg: null,
      });
      setFormErrors({});
      setError(null);
      toast.success("Item added successfully"); // Show success toast
    } catch (err) {
      console.error("Error adding item:", err);
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to add items."
          : err.response?.status === 403
          ? "Admin access required to add items."
          : err.response?.data?.message || "Failed to add item.";
      setFormErrors((prev) => ({ ...prev, submit: errorMessage }));
      toast.error(errorMessage); // Show error toast
    }
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewItem({
      name: "",
      materialgitType: "gold",
      waight: "",
      category: "",
      firm: "",
      quantity: "",
      price: "",
      makingCharge: "",
      stockImg: null,
    });
    setFormErrors({});
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleCategoryChange = (e) => setCategoryFilter(e.target.value);
  const handleMetalChange = (e) => setMetalFilter(e.target.value);
  const handleRemoveItem = async (stockId) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      await api.get(`/removeStock?stockId=${stockId}`);
      setStocks((prev) => prev.filter((stock) => stock._id !== stockId));
      setError(null);
      toast.success("Item removed successfully"); // Show success toast
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error(err.response?.data?.message || "Failed to remove item."); // Show error toast
    }
  };

  const getImageUrl = (stockImg) => {
    if (!stockImg) return "/fallback-image.png";
    // This regex ensures we get the path relative to the 'Uploads' directory
    // if the backend provides an absolute or full system path.
    // Replace backslashes with forward slashes for consistent URLs.
    const relativePath = stockImg
      .replace(/^.*[\\\/]Uploads[\\\/]/, "Uploads/")
      .replace(/\\/g, "/");
    return `${BASE_URL}/${relativePath}`;
  };

  // --- NEW: handlePrintBarcode function ---
  const handlePrintBarcode = (item) => {
    if (!item.stockcode) {
      toast.error("Stock code not available for this item.");
      return;
    }

    // Create a temporary container for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Print Barcode</title>");
    // Optional: Add some basic print styles if needed
    printWindow.document.write("<style>");
    printWindow.document.write(`
      @page { size: auto; margin: 0mm; }
      body { margin: 0; padding: 10mm; font-family: sans-serif; text-align: center; }
      .barcode-container { display: inline-block; padding: 5mm; border: 1px solid #ccc; margin: 5mm; }
      .item-info { font-size: 10px; margin-top: 5px; }
      svg { max-width: 100%; height: auto; }
    `);
    printWindow.document.write("</style>");
    printWindow.document.write("</head><body>");
    printWindow.document.write('<div class="barcode-container">');
    printWindow.document.write(
      `<div class="item-info">${item.name || "Item"}</div>`
    );
    printWindow.document.write(
      `<div class="item-info">Code: ${item.stockcode}</div>`
    );
    printWindow.document.write(`<svg id="print-barcode"></svg>`);
    printWindow.document.write("</div></body></html>");
    printWindow.document.close();

    // Render the barcode into the SVG element in the new window
    const svgElement = printWindow.document.getElementById("print-barcode");
    if (svgElement) {
      try {
        JsBarcode(svgElement, item.stockcode, {
          format: "CODE128",
          width: 2,
          height: 80, // Larger height for printing
          displayValue: true,
          fontSize: 14, // Larger font size for printing
          margin: 10, // Larger margin
          background: "#FFFFFF",
          lineColor: "#000000",
        });
        // Trigger print after barcode is rendered
        printWindow.print();
      } catch (error) {
        console.error("Error generating barcode for printing:", error);
        toast.error("Failed to generate barcode for printing.");
      }
    } else {
      toast.error("Error preparing print window. SVG element not found.");
    }
  };
  // --- END NEW FUNCTION ---

  const filteredItems = stocks.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter === "all" || item.category?.name === categoryFilter) &&
      (metalFilter === "all" || item.materialgitType === metalFilter)
  );

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
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
          onClose={() => setError(null)}
        >
          {error}
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
          Items Management
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
            onClick={handleAddItem}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Add Item
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
              width: { xs: "100%", sm: 150 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            variant="outlined"
          >
            <MenuItem
              value="all"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              All Categories
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem
                key={cat._id}
                value={cat.name}
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                {cat.name}
              </MenuItem>
            ))}
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
              width: { xs: "100%", sm: 150 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
            variant="outlined"
          >
            <MenuItem
              value="all"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              All Materials
            </MenuItem>
            <MenuItem
              value="gold"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Gold
            </MenuItem>
            <MenuItem
              value="silver"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Silver
            </MenuItem>
            <MenuItem
              value="platinum"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Platinum
            </MenuItem>
            <MenuItem
              value="diamond"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Diamond
            </MenuItem>
            <MenuItem
              value="other"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Other
            </MenuItem>
          </Select>
        </Box>
      </Box>

      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: { xs: 2, sm: 4 },
            }}
          >
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : filteredItems.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            No items found.
          </Typography>
        ) : (
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
                  <TableCell>Image</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Stock Code
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Material Type
                  </TableCell>
                  <TableCell>Weight (g)</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Making Charge (₹)
                  </TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Total Value (₹)
                  </TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    Barcode Print
                  </TableCell>{" "}
                  {/* Changed column header */}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item._id}
                    sx={{
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                        transition: "all 0.3s ease",
                      },
                      "& td": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        px: { xs: 1, sm: 2 },
                      },
                    }}
                  >
                    <TableCell>
                      {item.stockImg ? (
                        <Box
                          sx={{
                            width: { xs: 40, sm: 50 },
                            height: { xs: 40, sm: 50 },
                            borderRadius: 4,
                            overflow: "hidden",
                            display: "inline-block",
                          }}
                        >
                          <img
                            src={getImageUrl(item.stockImg)}
                            alt={item.name || "Stock"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src = "/fallback-image.png";
                            }}
                          />
                        </Box>
                      ) : (
                        "No Image"
                      )}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {item.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: { xs: "0.7rem", sm: "0.85rem" },
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {item.stockcode || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {item.category?.name ||
                        categories.find((c) => c._id === item.category)?.name ||
                        "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {item.materialgitType}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {item.waight}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {item.makingCharge}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {item.totalValue}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          color: theme.palette.secondary.main,
                          borderColor: theme.palette.secondary.main,
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                            borderColor: theme.palette.secondary.dark,
                          },
                          mr: 1,
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          px: { xs: 0.5, sm: 1 },
                        }}
                        disabled
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleRemoveItem(item._id)}
                        sx={{
                          borderColor: theme.palette.error.main,
                          "&:hover": {
                            bgcolor: theme.palette.error.light,
                            borderColor: theme.palette.error.dark,
                          },
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          px: { xs: 0.5, sm: 1 },
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                    {/* Barcode Print Button */}
                    <TableCell
                      sx={{
                        display: { xs: "none", lg: "table-cell" },
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PrintIcon />} // Use the imported PrintIcon
                        onClick={() => handlePrintBarcode(item)}
                        disabled={!item.stockcode} // Disable if no stock code
                        sx={{
                          bgcolor: theme.palette.info.main,
                          color: theme.palette.info.contrastText,
                          "&:hover": { bgcolor: theme.palette.info.dark },
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          px: { xs: 0.5, sm: 1 },
                          textTransform: "none",
                        }}
                      >
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box
          sx={{
            mt: 2,
            textAlign: "center",
            color: theme.palette.text.secondary,
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
          }}
        >
          Page 1
        </Box>
      </motion.div>

      <Dialog
        open={openAddModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Add New Item
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
            <Alert
              severity="error"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              onClose={() =>
                setFormErrors((prev) => ({ ...prev, submit: null }))
              }
            >
              {formErrors.submit}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Item Name"
            type="text"
            fullWidth
            value={newItem.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
          />
          <Select
            name="materialgitType"
            value={newItem.materialgitType}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!formErrors.materialgitType}
            required
          >
            <MenuItem
              value="gold"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Gold
            </MenuItem>
            <MenuItem
              value="silver"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Silver
            </MenuItem>
            <MenuItem
              value="platinum"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Platinum
            </MenuItem>
            <MenuItem
              value="diamond"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Diamond
            </MenuItem>
            <MenuItem
              value="other"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Other
            </MenuItem>
          </Select>
          <Select
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!formErrors.category}
            required
          >
            <MenuItem
              value=""
              disabled
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Select Category
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem
                key={cat._id}
                value={cat._id}
                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
              >
                {cat.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            name="firm"
            value={newItem.firm}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!formErrors.firm}
            required
          >
            <MenuItem
              value=""
              disabled
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              Select Firm
            </MenuItem>
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
          <TextField
            margin="dense"
            name="waight"
            label="Weight (g)"
            type="number"
            fullWidth
            value={newItem.waight}
            onChange={handleInputChange}
            error={!!formErrors.waight}
            helperText={formErrors.waight}
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Stock Quantity"
            type="number"
            fullWidth
            value={newItem.quantity}
            onChange={handleInputChange}
            error={!!formErrors.quantity}
            helperText={formErrors.quantity}
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
          />
          <TextField
            margin="dense"
            name="price"
            label="Price (₹)"
            type="number"
            fullWidth
            value={newItem.price}
            onChange={handleInputChange}
            error={!!formErrors.price}
            helperText={formErrors.price}
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
          />
          <TextField
            margin="dense"
            name="makingCharge"
            label="Making Charge (₹)"
            type="number"
            fullWidth
            value={newItem.makingCharge}
            onChange={handleInputChange}
            error={!!formErrors.makingCharge}
            helperText={formErrors.makingCharge}
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
          />
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            <Button
              variant="contained"
              component="label"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.text.primary,
                "&:hover": { bgcolor: theme.palette.secondary.dark },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              Upload Image
              <input
                type="file"
                hidden
                name="stock"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Button>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: theme.palette.text.secondary,
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
              }}
            >
              {newItem.stockImg ? newItem.stockImg.name : "No file chosen"}
            </Typography>
            {newItem.stockImg && (
              <img
                src={URL.createObjectURL(newItem.stockImg)}
                alt="Preview"
                style={{
                  width: 80, // Fixed width for preview
                  height: 80, // Fixed height for preview
                  borderRadius: 4,
                  marginTop: 8,
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.src = "/fallback-image.png";
                }}
              />
            )}
            {formErrors.stockImg && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                {formErrors.stockImg}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              color: theme.palette.text.primary,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Save Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ItemManagement;
