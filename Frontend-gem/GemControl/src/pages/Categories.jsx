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
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TextField,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add, Delete } from "@mui/icons-material";
import api from "../utils/api";

function Categories() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "", // Added description
    CategoryImg: null, // Changed to CategoryImg to match backend
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

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/getAllStockCategories");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading categories");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!newCategory.name.trim()) errors.name = "Category name is required";
    if (!newCategory.description.trim())
      errors.description = "Description is required";
    if (!newCategory.CategoryImg) errors.CategoryImg = "Image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategory = () => {
    setOpenAddModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
    setFormErrors({ ...formErrors, [name]: null, submit: null });
  };

  const handleFileChange = (e) => {
    setNewCategory({ ...newCategory, CategoryImg: e.target.files[0] });
    setFormErrors({ ...formErrors, CategoryImg: null, submit: null });
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("description", newCategory.description);
    if (newCategory.CategoryImg)
      formData.append("CategoryImg", newCategory.CategoryImg);

    try {
      const response = await api.post("/createStockCategory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories([...categories, response.data.category]);
      setOpenAddModal(false);
      setNewCategory({ name: "", description: "", CategoryImg: null });
      setFormErrors({});
    } catch (err) {
      console.error("Error adding category:", err);
      setFormErrors({
        submit: err.response?.data?.message || "Error adding category",
      });
    }
  };

  const handleRemoveCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to remove this category?"))
      return;
    try {
      await api.get(`/removeStockCategory?categoryId=${categoryId}`);
      setCategories(
        categories.filter((category) => category._id !== categoryId)
      );
    } catch (err) {
      console.error("Error removing category:", err);
      setError(err.response?.data?.message || "Error removing category");
    }
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewCategory({ name: "", description: "", CategoryImg: null });
    setFormErrors({});
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
          Categories Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCategory}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Add Category
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
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
        </Box>
      </Box>

      {/* Categories Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : (
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
                  <TableCell>Category Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow
                    key={category._id}
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
                      {category._id}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {category.name}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {category.description}
                    </TableCell>
                    <TableCell>
                      {category.CategoryImg && (
                        <img
                          src={`http://localhost:3002/${category.CategoryImg}`} // Adjust base URL if needed
                          alt={category.name}
                          style={{ width: 50, height: 50, borderRadius: 4 }}
                        />
                      )}
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
                          mr: 1,
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleRemoveCategory(category._id)}
                        sx={{
                          borderColor: theme.palette.error.main,
                          "&:hover": {
                            bgcolor: theme.palette.error.light,
                            borderColor: theme.palette.error.dark,
                          },
                        }}
                      >
                        Remove
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
          }}
        >
          Page 1
        </Box>
      </motion.div>

      {/* Add Category Modal */}
      <Dialog open={openAddModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Add New Category
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            value={newCategory.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={newCategory.description}
            onChange={handleInputChange}
            error={!!formErrors.description}
            helperText={formErrors.description}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            component="label"
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#c2833a" },
              mb: 2,
            }}
          >
            Upload Image
            <input
              type="file"
              hidden
              name="CategoryImg"
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, mb: 2 }}
          >
            {newCategory.CategoryImg
              ? newCategory.CategoryImg.name
              : "No file chosen"}
          </Typography>
          {newCategory.CategoryImg && (
            <img
              src={URL.createObjectURL(newCategory.CategoryImg)}
              alt="Preview"
              style={{
                width: 100,
                height: 100,
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Categories;
