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
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api from "../utils/api";
import { useCallback } from "react";

function Categories() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    CategoryImg: null,
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/getAllStockCategories");
      setCategories(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to view categories.");
        dispatch(setAuthError("Please log in to view categories."));
        navigate(ROUTES.LOGIN);
      } else {
        setError(err.response?.data?.message || "Failed to load categories.");
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    if (!currentUser) {
      setError("Please log in to add categories.");
      dispatch(setAuthError("Please log in to add categories."));
      navigate(ROUTES.LOGIN);
      return;
    }
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
    const file = e.target.files[0];
    if (file) {
      setNewCategory({ ...newCategory, CategoryImg: file });
      setFormErrors({ ...formErrors, CategoryImg: null, submit: null });
    }
  };

  const handleSaveCategory = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("name", newCategory.name);
      formData.append("description", newCategory.description);
      formData.append("CategoryImg", newCategory.CategoryImg);

      const response = await api.post("/createStockCategory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchCategories();
      setOpenAddModal(false);
      setNewCategory({ name: "", description: "", CategoryImg: null });
      setFormErrors({});
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.status === 403
          ? "Admin access required to add categories."
          : err.response?.data?.message || "Failed to add category.";
      setFormErrors({ submit: errorMessage });
      dispatch(setAuthError(errorMessage));
    }
  }, [newCategory, fetchCategories, dispatch]);

  const handleRemoveCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this category? This may affect related stocks."
      )
    ) {
      return;
    }
    try {
      await api.get(`/removeStockCategory?categoryId=${categoryId}`);
      setCategories(
        categories.filter((category) => category._id !== categoryId)
      );
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove category.");
    }
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewCategory({ name: "", description: "", CategoryImg: null });
    setFormErrors({});
  };

  const filteredCategories = categories.filter((category) =>
    (category.name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          Categories Management
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
            onClick={handleAddCategory}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Add Category
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
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
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
        ) : filteredCategories.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            No categories found.
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
                  <TableCell>Category Name</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Description
                  </TableCell>
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
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {category.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {category.description}
                    </TableCell>
                    <TableCell>
                      {category.CategoryImg ? (
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
                         src={`http://localhost:3002/${category.CategoryImg}`}
                         alt={category.name || "Category"}
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
                        onClick={() => handleRemoveCategory(category._id)}
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

      <Dialog open={openAddModal} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Add New Category
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
            <Alert
              severity="error"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
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
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
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
                name="CategoryImg"
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
              {newCategory.CategoryImg
                ? newCategory.CategoryImg.name
                : "No file chosen"}
            </Typography>
            {newCategory.CategoryImg && (
              <img
                src={URL.createObjectURL(newCategory.CategoryImg)}
                alt="Preview"
                style={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: 4,
                  mt: 1,
                }}
                onError={(e) => {
                  e.target.src = "/fallback-image.png";
                }}
              />
            )}
            {formErrors.CategoryImg && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                {formErrors.CategoryImg}
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
            onClick={handleSaveCategory}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
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