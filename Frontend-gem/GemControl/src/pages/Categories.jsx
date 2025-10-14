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
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Add, Delete, Close } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setError as setAuthError } from '../redux/authSlice';
import { ROUTES } from '../utils/routes';
import api from '../utils/api';
import NotificationModal from '../components/NotificationModal';

function Categories() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    CategoryImg: null,
  });
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: '',
    type: 'info',
    title: '',
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.3, ease: 'easeOut' },
    },
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/getAllStockCategories');
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('GetCategories error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 401
          ? 'Please log in to view categories.'
          : err.response?.data?.message || 'Failed to load categories.';
      setNotificationDialog({ open: true, message: errorMessage, type: 'error', title: 'Error' });
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
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
    if (!newCategory.name.trim()) errors.name = 'Category name is required';
    if (!newCategory.description.trim()) errors.description = 'Description is required';
    if (!newCategory.CategoryImg) errors.CategoryImg = 'Image is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategory = () => {
    if (!currentUser) {
      setNotificationDialog({
        open: true,
        message: 'Please log in to add categories.',
        type: 'error',
        title: 'Authentication Required',
      });
      dispatch(setAuthError('Please log in to add categories.'));
      navigate(ROUTES.LOGIN);
      return;
    }
    setNewCategory({ name: '', description: '', CategoryImg: null });
    setFormErrors({});
    setOpenAddModal(true);
  };

  const handleRemoveCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to remove this category? This may affect related stocks.')) {
      return;
    }
    try {
      setLoading(true);
      await api.get(`/removeStockCategory?categoryId=${categoryId}`);
      setCategories(categories.filter((category) => category._id !== categoryId));
      setNotificationDialog({
        open: true,
        message: 'Category removed successfully!',
        type: 'success',
        title: 'Success',
      });
    } catch (err) {
      console.error('RemoveCategory error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setNotificationDialog({
        open: true,
        message: err.response?.data?.message || 'Failed to remove category.',
        type: 'error',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
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
    if (!validateForm()) {
      setNotificationDialog({
        open: true,
        message: 'Please correct the form errors.',
        type: 'error',
        title: 'Validation Error',
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description);
      formData.append('CategoryImg', newCategory.CategoryImg);

      await api.post('/createStockCategory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchCategories();
      setOpenAddModal(false);
      setNewCategory({ name: '', description: '', CategoryImg: null });
      setFormErrors({});
      setNotificationDialog({
        open: true,
        message: 'Category added successfully!',
        type: 'success',
        title: 'Success',
      });
    } catch (err) {
      console.error('CreateCategory error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 403
          ? 'Admin access required to add categories.'
          : err.response?.data?.message || 'Failed to add category.';
      setFormErrors({ submit: errorMessage });
      setNotificationDialog({ open: true, message: errorMessage, type: 'error', title: 'Error' });
      dispatch(setAuthError(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [newCategory, fetchCategories, dispatch]);

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewCategory({ name: '', description: '', CategoryImg: null });
    setFormErrors({});
  };

  const handleNotificationClose = () => {
    setNotificationDialog({ ...notificationDialog, open: false });
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        (category.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [categories, searchQuery]
  );

  const paginatedCategories = useMemo(
    () =>
      filteredCategories.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredCategories, page]
  );

  return (
    <Box
      sx={{
        maxWidth: '100%',
        margin: '0 auto',
        width: '100%',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          mb: { xs: 2, sm: 3, md: 4 },
        }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 'bold',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              textAlign: { xs: 'center', sm: 'left' },
              mb: { xs: 1, sm: 0 },
            }}
          >
            Categories Management
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddCategory}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                '&:hover': { bgcolor: theme.palette.primary.dark },
                borderRadius: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
              }}
            >
              Add Category
            </Button>
            <Paper
              sx={{
                p: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', sm: 200, md: 250 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <IconButton sx={{ p: { xs: 0.5, sm: 1 } }}>
                <Search sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
              </IconButton>
              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
                placeholder="Search categories..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </Paper>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <motion.div variants={tableVariants} initial="hidden" animate="visible">
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: { xs: 2, sm: 3 },
              }}
            >
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : filteredCategories.length === 0 ? (
            <Typography
              sx={{
                color: theme.palette.text.primary,
                textAlign: 'center',
                py: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              No categories found.
            </Typography>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {paginatedCategories.map((category) => (
                  <Card
                    key={category._id}
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      boxShadow: theme.shadows[2],
                      '&:hover': { boxShadow: theme.shadows[4] },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {category.CategoryImg ? (
                          <img
                            src={`http://43.205.136.91:3002/${category.CategoryImg}`}
                            alt={category.name || 'Category'}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: 'contain',
                              borderRadius: 4,
                            }}
                            onError={(e) => (e.target.src = '/fallback-image.png')}
                          />
                        ) : (
                          <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                            No Image
                          </Typography>
                        )}
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                            {category.name || 'N/A'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem' }}>
                            Description: {category.description || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          fontSize: '0.75rem',
                          px: 1,
                          textTransform: 'none',
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete fontSize="small" />}
                        onClick={() => handleRemoveCategory(category._id)}
                        sx={{
                          fontSize: '0.75rem',
                          px: 1,
                          textTransform: 'none',
                        }}
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>

              {/* Desktop Table Layout */}
              <TableContainer
                component={Paper}
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  width: '100%',
                  overflowX: 'auto',
                  borderRadius: 1,
                  boxShadow: theme.shadows[2],
                }}
              >
                <Table
                  sx={{
                    minWidth: 650,
                    '& .MuiTableCell-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        '& th': {
                          fontWeight: 'bold',
                          borderBottom: `2px solid ${theme.palette.secondary.main}`,
                          px: { xs: 1, sm: 2 },
                          py: 1,
                        },
                      }}
                    >
                      <TableCell sx={{ minWidth: 150 }}>Category Name</TableCell>
                      <TableCell sx={{ minWidth: 200, display: { xs: 'none', md: 'table-cell' } }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>Image</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCategories.map((category) => (
                      <TableRow
                        key={category._id}
                        sx={{
                          '&:hover': { bgcolor: theme.palette.action.hover },
                          '& td': {
                            px: { xs: 1, sm: 2 },
                            py: 1,
                          },
                        }}
                      >
                        <TableCell>{category.name || 'N/A'}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {category.description || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {category.CategoryImg ? (
                            <Box
                              sx={{
                                width: { xs: 40, sm: 50 },
                                height: { xs: 40, sm: 50 },
                                borderRadius: 1,
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={`http://43.205.136.91:3002/${category.CategoryImg}`}
                                alt={category.name || 'Category'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                                onError={(e) => (e.target.src = '/fallback-image.png')}
                              />
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: '0.75rem' }}>No Image</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="Edit functionality coming soon">
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{ fontSize: '0.75rem', px: 1, textTransform: 'none' }}
                              >
                                Edit
                              </Button>
                            </span>
                          </Tooltip>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<Delete fontSize="small" />}
                            onClick={() => handleRemoveCategory(category._id)}
                            sx={{ fontSize: '0.75rem', px: 1, textTransform: 'none' }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {filteredCategories.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Categories: {filteredCategories.length}
                  </Typography>
                  <Pagination
                    count={Math.ceil(filteredCategories.length / itemsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{ '& .MuiPaginationItem-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
                  />
                </Box>
              )}
            </>
          )}
        </motion.div>
      </Box>

      <Dialog
        open={openAddModal}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: '95%', sm: 500 },
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: '0.875rem', sm: '1rem' },
            py: 1,
            position: 'relative',
          }}
        >
          Add New Category
          <IconButton
            onClick={handleCancel}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
            <Box
              sx={{
                mb: 1,
                p: 1,
                bgcolor: theme.palette.error.light,
                borderRadius: 1,
                color: theme.palette.error.contrastText,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {formErrors.submit}
            </Box>
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
            }}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
            }}
            required
          />
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            <Button
              variant="contained"
              component="label"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.getContrastText(theme.palette.secondary.main),
                '&:hover': { bgcolor: theme.palette.secondary.dark },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
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
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
              }}
            >
              {newCategory.CategoryImg ? newCategory.CategoryImg.name : 'No file chosen'}
            </Typography>
            {newCategory.CategoryImg && (
              <img
                src={URL.createObjectURL(newCategory.CategoryImg)}
                alt="Preview"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 4,
                  marginTop: 8,
                  objectFit: 'contain',
                }}
                onError={(e) => (e.target.src = '/fallback-image.png')}
              />
            )}
            {formErrors.CategoryImg && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, mt: 1 }}
              >
                {formErrors.CategoryImg}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            p: 1,
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              width: { xs: '100%', sm: 'auto' },
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              '&:hover': { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              width: { xs: '100%', sm: 'auto' },
              textTransform: 'none',
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationModal
        isOpen={notificationDialog.open}
        onClose={handleNotificationClose}
        title={notificationDialog.title}
        message={notificationDialog.message}
        type={notificationDialog.type}
      />
    </Box>
  );
}

export default Categories;