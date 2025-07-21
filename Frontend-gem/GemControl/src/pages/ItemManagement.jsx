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
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Add, Delete, Print as PrintIcon, Close } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setError as setAuthError } from '../redux/authSlice';
import { ROUTES } from '../utils/routes';
import api, { BASE_URL } from '../utils/api';
import JsBarcode from 'jsbarcode';
import { toast } from 'react-toastify';
import NotificationModal from '../components/NotificationModal';

function ItemManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [metalFilter, setMetalFilter] = useState('all');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [newItem, setNewItem] = useState({
    name: '',
    materialgitType: 'gold',
    waight: '',
    category: '',
    firm: '',
    quantity: '',
    price: '',
    makingCharge: '',
    stockImg: null,
  });

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3, ease: 'easeOut' } },
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [stockResponse, categoryResponse, firmResponse] = await Promise.all([
        api.get('/getAllStocks'),
        api.get('/getAllStockCategories'),
        api.get('/getAllFirms'),
      ]);
      setStocks(Array.isArray(stockResponse.data) ? stockResponse.data : []);
      setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
      setFirms(Array.isArray(firmResponse.data) ? firmResponse.data : []);
      setError(null);
    } catch (err) {
      console.error('FetchData error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 401
          ? 'Please log in to view items.'
          : err.response?.data?.message || 'Failed to load data.';
      setError(errorMessage);
      if (err.response?.status === 401) {
        dispatch(setAuthError(errorMessage));
        navigate(ROUTES.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!newItem.name.trim()) errors.name = 'Item name is required';
    if (!newItem.materialgitType) errors.materialgitType = 'Material type is required';
    if (!newItem.waight || isNaN(newItem.waight) || newItem.waight <= 0)
      errors.waight = 'Valid weight is required';
    if (!newItem.category) errors.category = 'Category is required';
    if (!newItem.firm) errors.firm = 'Firm is required';
    if (!newItem.quantity || isNaN(newItem.quantity) || newItem.quantity <= 0)
      errors.quantity = 'Valid quantity is required';
    if (!newItem.price || isNaN(newItem.price) || newItem.price <= 0)
      errors.price = 'Valid price is required';
    if (!newItem.makingCharge || isNaN(newItem.makingCharge) || newItem.makingCharge < 0)
      errors.makingCharge = 'Valid making charge is required';
    if (!newItem.stockImg) errors.stockImg = 'Image is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newItem]);

  const generateStockCode = useCallback(() => {
    return `STOCK-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }, []);

  const handleAddItem = useCallback(() => {
    if (!currentUser) {
      setError('Please log in to add items.');
      dispatch(setAuthError('Please log in to add items.'));
      navigate(ROUTES.LOGIN);
      return;
    }
    setNewItem({
      name: '',
      materialgitType: 'gold',
      waight: '',
      category: '',
      firm: '',
      quantity: '',
      price: '',
      makingCharge: '',
      stockImg: null,
    });
    setFormErrors({});
    setOpenAddModal(true);
  }, [currentUser, dispatch, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null, submit: null }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem((prev) => ({ ...prev, stockImg: file }));
      setFormErrors((prev) => ({ ...prev, stockImg: null, submit: null }));
    }
  }, []);

  const handleSaveItem = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Please correct the form errors.');
      return;
    }

    try {
      setLoading(true);
      const stockcode = generateStockCode();
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('materialgitType', newItem.materialgitType);
      formData.append('waight', newItem.waight);
      formData.append('category', newItem.category);
      formData.append('firm', newItem.firm);
      formData.append('quantity', newItem.quantity);
      formData.append('price', newItem.price);
      formData.append('makingCharge', newItem.makingCharge);
      formData.append('stockcode', stockcode);
      if (newItem.stockImg) formData.append('stock', newItem.stockImg);

      const response = await api.post('/Addstock', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStocks((prev) => [...prev, response.data.stock]);
      setOpenAddModal(false);
      setNewItem({
        name: '',
        materialgitType: 'gold',
        waight: '',
        category: '',
        firm: '',
        quantity: '',
        price: '',
        makingCharge: '',
        stockImg: null,
      });
      setFormErrors({});
      setError(null);
      setNotificationDialog({
        open: true,
        message: 'Item added successfully!',
        type: 'success',
        title: 'Success',
      });
      toast.success('Item added successfully');
    } catch (err) {
      console.error('AddStock error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 401
          ? 'Please log in to add items.'
          : err.response?.status === 403
            ? 'Admin access required to add items.'
            : err.response?.data?.message || 'Failed to add item.';
      setFormErrors((prev) => ({ ...prev, submit: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [newItem, generateStockCode, validateForm]);

  const handleRemoveItem = useCallback(async (stockId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      setLoading(true);
      await api.get(`/removeStock?stockId=${stockId}`);
      setStocks((prev) => prev.filter((stock) => stock._id !== stockId));
      setError(null);
      setNotificationDialog({
        open: true,
        message: 'Item removed successfully!',
        type: 'success',
        title: 'Success',
      });
      toast.success('Item removed successfully');
    } catch (err) {
      console.error('RemoveStock error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage = err.response?.data?.message || 'Failed to remove item.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrintBarcode = useCallback((item) => {
    if (!item.stockcode) {
      setNotificationDialog({
        open: true,
        message: 'Stock code not available for this item.',
        type: 'error',
        title: 'Error',
      });
      toast.error('Stock code not available for this item.');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Barcode</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @page { size: auto; margin: 0mm; }
      body { margin: 0; padding: 10mm; font-family: sans-serif; text-align: center; }
      .barcode-container { display: inline-block; padding: 5mm; border: 1px solid #ccc; margin: 5mm; }
      .item-info { font-size: 10px; margin-top: 5px; }
      svg { max-width: 100%; height: auto; }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="barcode-container">');
    printWindow.document.write(`<div class="item-info">${item.name || 'Item'}</div>`);
    printWindow.document.write(`<div class="item-info">Code: ${item.stockcode}</div>`);
    printWindow.document.write(`<svg id="print-barcode"></svg>`);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();

    const svgElement = printWindow.document.getElementById('print-barcode');
    if (svgElement) {
      try {
        JsBarcode(svgElement, item.stockcode, {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: '#FFFFFF',
          lineColor: '#000000',
        });
        printWindow.print();
      } catch (error) {
        console.error('Barcode generation error:', error);
        setNotificationDialog({
          open: true,
          message: 'Failed to generate barcode for printing.',
          type: 'error',
          title: 'Error',
        });
        toast.error('Failed to generate barcode for printing.');
      }
    } else {
      setNotificationDialog({
        open: true,
        message: 'Error preparing print window.',
        type: 'error',
        title: 'Error',
      });
      toast.error('Error preparing print window.');
    }
  }, []);

  const handleSearch = useCallback((e) => setSearchQuery(e.target.value), []);
  const handleCategoryChange = useCallback((e) => setCategoryFilter(e.target.value), []);
  const handleMetalChange = useCallback((e) => setMetalFilter(e.target.value), []);

  const handleCancel = useCallback(() => {
    setOpenAddModal(false);
    setNewItem({
      name: '',
      materialgitType: 'gold',
      waight: '',
      category: '',
      firm: '',
      quantity: '',
      price: '',
      makingCharge: '',
      stockImg: null,
    });
    setFormErrors({});
  }, []);

  const handleNotificationClose = useCallback(() => {
    setNotificationDialog({ open: false, message: '', type: 'info', title: '' });
  }, []);

  const filteredItems = useMemo(
    () =>
      stocks.filter(
        (item) =>
          (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
          (categoryFilter === 'all' || item.category?.name === categoryFilter) &&
          (metalFilter === 'all' || item.materialgitType === metalFilter)
      ),
    [stocks, searchQuery, categoryFilter, metalFilter]
  );

  const getImageUrl = (stockImg) => {
    if (!stockImg) return '/fallback-image.png';
    return `${BASE_URL}/${stockImg
      .replace(/^.*[\\\/]Uploads[\\\/]/, 'Uploads/')
      .replace(/\\/g, '/')}`;
  };

  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: '',
    type: 'info',
    title: '',
  });

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
      {error && (
        <NotificationModal
          isOpen={true}
          onClose={() => setError(null)}
          title="Error"
          message={error}
          type="error"
        />
      )}
      <Box
        sx={{
          flexShrink: 0,
          mb: { xs: 2, sm: 4 },
        }}
        component={motion.div}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            Items Management
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddItem}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                '&:hover': { bgcolor: theme.palette.primary.dark },
                borderRadius: 2,
                width: { xs: '100%', sm: 'auto' },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                minWidth: { xs: '100%', sm: 120 },
                textTransform: 'none',
              }}
            >
              Add Item
            </Button>
            <Paper
              sx={{
                p: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', sm: 200, md: 300 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <IconButton sx={{ p: { xs: 0.5, sm: 1 } }}>
                <Search
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                  }}
                />
              </IconButton>
              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  color: theme.palette.text.primary,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
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
                '.MuiSelect-icon': { color: theme.palette.text.secondary },
                width: { xs: '100%', sm: 150 },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
              }}
              variant="outlined"
            >
              <MenuItem value="all" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                All Categories
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem
                  key={cat._id}
                  value={cat.name}
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
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
                '.MuiSelect-icon': { color: theme.palette.text.secondary },
                width: { xs: '100%', sm: 150 },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
              }}
              variant="outlined"
            >
              <MenuItem value="all" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                All Materials
              </MenuItem>
              <MenuItem value="gold" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Gold
              </MenuItem>
              <MenuItem value="silver" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Silver
              </MenuItem>
              <MenuItem value="platinum" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Platinum
              </MenuItem>
              <MenuItem value="diamond" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Diamond
              </MenuItem>
              <MenuItem value="other" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                Other
              </MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <motion.div variants={tableVariants} initial="hidden" animate="visible">
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: { xs: 2, sm: 4 },
              }}
            >
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Typography
              sx={{
                color: theme.palette.text.primary,
                textAlign: 'center',
                py: { xs: 2, sm: 4 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              No items found.
            </Typography>
          ) : (
            <><TableContainer
                  component={Paper}
                  sx={{
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'visible',
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    '&:hover': { boxShadow: theme.shadows[8] },
                  }}
                >
                  <Table
                    sx={{
                      width: '100%',
                      minWidth: { xs: 800, sm: 1000 },
                      tableLayout: 'auto',
                      '& .MuiTableCell-root': {
                        wordBreak: 'break-word',
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          '& th': {
                            color: theme.palette.text.primary,
                            fontWeight: 'bold',
                            borderBottom: `2px solid ${theme.palette.secondary.main}`,
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            px: { xs: 1, sm: 2 },
                            py: { xs: 0.5, sm: 1 },
                          },
                        }}
                      >
                        <TableCell sx={{ minWidth: 80 }}>Image</TableCell>
                        <TableCell sx={{ minWidth: 120 }}>Item Name</TableCell>
                        <TableCell sx={{ minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>
                          Stock Code
                        </TableCell>
                        <TableCell sx={{ minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>
                          Category
                        </TableCell>
                        <TableCell sx={{ minWidth: 100, display: { xs: 'none', md: 'table-cell' } }}>
                          Material Type
                        </TableCell>
                        <TableCell sx={{ minWidth: 80 }}>Weight (g)</TableCell>
                        <TableCell sx={{ minWidth: 100, display: { xs: 'none', md: 'table-cell' } }}>
                          Making Charge (₹)
                        </TableCell>
                        <TableCell sx={{ minWidth: 80 }}>Stock</TableCell>
                        <TableCell sx={{ minWidth: 100, display: { xs: 'none', md: 'table-cell' } }}>
                          Total Value (₹)
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>Action</TableCell>
                        <TableCell sx={{ minWidth: 120, display: { xs: 'none', lg: 'table-cell' } }}>
                          Barcode Print
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow
                          key={item._id}
                          sx={{
                            '&:hover': {
                              bgcolor: theme.palette.action.hover,
                              transition: 'all 0.3s ease',
                            },
                            '& td': {
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              px: { xs: 1, sm: 2 },
                              py: { xs: 0.5, sm: 1 },
                            },
                          }}
                        >
                          <TableCell>
                            {item.stockImg ? (
                              <Box
                                sx={{
                                  width: { xs: 40, sm: 50 },
                                  height: { xs: 40, sm: 50 },
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  display: 'inline-block',
                                }}
                              >
                                <img
                                  src={getImageUrl(item.stockImg)}
                                  alt={item.name || 'Stock'}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                  onError={(e) => {
                                    console.error(`Failed to load image: ${item.stockImg}`);
                                    e.target.src = '/fallback-image.png';
                                  } } />
                              </Box>
                            ) : (
                              <Typography sx={{ color: theme.palette.text.secondary }}>
                                No Image
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {item.name || 'N/A'}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.primary,
                              fontSize: { xs: '0.7rem', sm: '0.85rem' },
                              display: { xs: 'none', sm: 'table-cell' },
                            }}
                          >
                            {item.stockcode || 'N/A'}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.primary,
                              display: { xs: 'none', sm: 'table-cell' },
                            }}
                          >
                            {item.category?.name ||
                              categories.find((c) => c._id === item.category)?.name ||
                              'N/A'}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.primary,
                              display: { xs: 'none', md: 'table-cell' },
                            }}
                          >
                            {item.materialgitType || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {item.waight || 'N/A'}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.primary,
                              display: { xs: 'none', md: 'table-cell' },
                            }}
                          >
                            {item.makingCharge || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: theme.palette.text.primary }}>
                            {item.quantity || 'N/A'}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.text.primary,
                              display: { xs: 'none', md: 'table-cell' },
                            }}
                          >
                            {item.totalValue || 'N/A'}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: 'flex',
                              gap: { xs: 0.5, sm: 1 },
                              flexWrap: 'wrap',
                            }}
                          >
                            <Tooltip title="Edit functionality coming soon">
                              <span>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    color: theme.palette.secondary.main,
                                    borderColor: theme.palette.secondary.main,
                                    '&:hover': {
                                      bgcolor: theme.palette.action.hover,
                                      borderColor: theme.palette.secondary.dark,
                                    },
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    px: { xs: 1, sm: 1.5 },
                                    minWidth: 80,
                                    textTransform: 'none',
                                  }}
                                  disabled
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
                              onClick={() => handleRemoveItem(item._id)}
                              sx={{
                                borderColor: theme.palette.error.main,
                                '&:hover': {
                                  bgcolor: theme.palette.error.light,
                                  borderColor: theme.palette.error.dark,
                                },
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                px: { xs: 1, sm: 1.5 },
                                minWidth: 80,
                                textTransform: 'none',
                              }}
                            >
                              Remove
                            </Button>
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', lg: 'table-cell' },
                            }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PrintIcon fontSize="small" />}
                              onClick={() => handlePrintBarcode(item)}
                              disabled={!item.stockcode}
                              sx={{
                                bgcolor: theme.palette.info.main,
                                color: theme.palette.getContrastText(theme.palette.info.main),
                                '&:hover': { bgcolor: theme.palette.info.dark },
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                px: { xs: 1, sm: 1.5 },
                                minWidth: 80,
                                textTransform: 'none',
                              }}
                            >
                              Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer><Box
                  sx={{
                    mt: 2,
                    textAlign: 'center',
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    flexShrink: 0,
                  }}
                >
                    Page 1
                  </Box></>
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
            minWidth: { xs: 300, sm: 500 },
            borderRadius: 2,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: '1rem', sm: '1.25rem' },
            position: 'relative',
          }}
        >
          Add New Item
          <IconButton
            onClick={handleCancel}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              p: { xs: 0.5, sm: 1 },
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
            <Alert
              severity="error"
              sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
              onClose={() => setFormErrors((prev) => ({ ...prev, submit: null }))}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            required
          />
          <Select
            name="materialgitType"
            value={newItem.materialgitType}
            onChange={handleInputChange}
            fullWidth
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiSelect-select': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            error={!!formErrors.materialgitType}
            required
          >
            <MenuItem value="gold" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Gold
            </MenuItem>
            <MenuItem value="silver" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Silver
            </MenuItem>
            <MenuItem value="platinum" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Platinum
            </MenuItem>
            <MenuItem value="diamond" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Diamond
            </MenuItem>
            <MenuItem value="other" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Other
            </MenuItem>
          </Select>
          <Select
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
            fullWidth
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiSelect-select': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            error={!!formErrors.category}
            required
          >
            <MenuItem value="" disabled sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Select Category
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem
                key={cat._id}
                value={cat._id}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiSelect-select': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            error={!!formErrors.firm}
            required
          >
            <MenuItem value="" disabled sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Select Firm
            </MenuItem>
            {firms.map((firm) => (
              <MenuItem
                key={firm._id}
                value={firm._id}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
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
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
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
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
              }}
            >
              {newItem.stockImg ? newItem.stockImg.name : 'No file chosen'}
            </Typography>
            {newItem.stockImg && (
              <img
                src={URL.createObjectURL(newItem.stockImg)}
                alt="Preview"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 4,
                  marginTop: 8,
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  console.error('Failed to preview image');
                  e.target.src = '/fallback-image.png';
                }}
              />
            )}
            {formErrors.stockImg && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, mt: 1 }}
              >
                {formErrors.stockImg}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
            pb: { xs: 1.5, sm: 2 },
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              width: { xs: '100%', sm: 'auto' },
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              '&:hover': { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 120 },
              textTransform: 'none',
            }}
          >
            Save Item
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

export default ItemManagement;