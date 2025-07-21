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
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Add, Close, Delete } from '@mui/icons-material';
import api from '../utils/api';
import NotificationModal from '../components/NotificationModal'; 

function CustomerManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerType, setCustomerType] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    firm: '',
  });
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: '',
    type: 'info',
    title: '',
  });

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [customerResponse, firmResponse] = await Promise.all([
        api.get('/getAllCustomers'),
        api.get('/getAllFirms'),
      ]);
      setCustomers(Array.isArray(customerResponse.data) ? customerResponse.data : []);
      setFirms(Array.isArray(firmResponse.data) ? firmResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setNotificationDialog({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch data',
        type: 'error',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = () => {
    const newErrors = {};
    if (!newCustomer.name.trim()) newErrors.name = 'Name is required';
    if (!newCustomer.contact.trim()) newErrors.contact = 'Contact is required';
    else if (!/^\d{10}$/.test(newCustomer.contact.trim())) newErrors.contact = 'Contact must be 10 digits';
    if (!newCustomer.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newCustomer.email)) newErrors.email = 'Invalid email format';
    if (!newCustomer.firm) newErrors.firm = 'Firm is required';
    if (!newCustomer.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCustomer = useCallback(async () => {
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
      const response = await api.post('/AddCustomer', newCustomer);
      await fetchData();
      setNotificationDialog({
        open: true,
        message: 'Customer added successfully!',
        type: 'success',
        title: 'Success',
      });
      handleCloseModal();
    } catch (error) {
      console.error('Error adding customer:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      const errorMessage = error.response?.data?.message || 'Failed to add customer';
      setErrors({ submit: errorMessage });
      setNotificationDialog({ open: true, message: errorMessage, type: 'error', title: 'Error' });
    } finally {
      setLoading(false);
    }
  }, [newCustomer, fetchData]);

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      setLoading(true);
      await api.get(`/removeCustomer?customerId=${customerId}`);
      setCustomers(customers.filter((customer) => customer._id !== customerId));
      setNotificationDialog({
        open: true,
        message: 'Customer deleted successfully!',
        type: 'success',
        title: 'Success',
      });
    } catch (error) {
      console.error('DeleteCustomer error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setNotificationDialog({
        open: true,
        message: error.response?.data?.message || 'Failed to delete customer',
        type: 'error',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewCustomer({
      name: '',
      contact: '',
      email: '',
      address: '',
      firm: '',
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
    setErrors({ ...errors, [name]: null, submit: null });
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleNotificationClose = () => {
    setNotificationDialog({ ...notificationDialog, open: false });
  };

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const matchesSearch =
          (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.contact || '').includes(searchQuery);
        return matchesSearch;
      }),
    [customers, searchQuery]
  );

  return (
    <Box
      sx={{
        maxWidth: '100%',
        margin: '0 auto',
        width: '100%',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, sm: 4 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
        }}
        component={motion.div}
        variants={sectionVariants}
        initial='hidden'
        animate='visible'
      >
        <Typography
          variant='h4'
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          Customer Management
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
            variant='contained'
            startIcon={<Add />}
            onClick={handleOpenModal}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              '&:hover': { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              textTransform: 'none',
            }}
          >
            Add Customer
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
              placeholder='Search customers...'
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component={motion.div}
          variants={modalVariants}
          initial='hidden'
          animate='visible'
          sx={{
            bgcolor: theme.palette.background.paper,
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: theme.shadows[10],
            width: { xs: '90%', sm: 400, md: 500 },
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: theme.palette.text.secondary,
              '&:hover': { color: theme.palette.text.primary },
              p: { xs: 0.5, sm: 1 },
            }}
            aria-label='Close modal'
          >
            <Close sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
          </IconButton>
          <Typography
            variant='h6'
            sx={{
              mb: { xs: 2, sm: 3 },
              color: theme.palette.text.primary,
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Add New Customer
          </Typography>
          {errors.submit && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: theme.palette.error.light,
                borderRadius: 1,
                color: theme.palette.error.contrastText,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
              }}
            >
              {errors.submit}
            </Box>
          )}
          <TextField
            label='Name'
            name='name'
            value={newCustomer.name}
            onChange={handleInputChange}
            fullWidth
            margin='normal'
            error={!!errors.name}
            helperText={errors.name}
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            required
          />
          <TextField
            label='Contact'
            name='contact'
            value={newCustomer.contact}
            onChange={handleInputChange}
            fullWidth
            margin='normal'
            error={!!errors.contact}
            helperText={errors.contact}
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            required
          />
          <TextField
            label='Email'
            name='email'
            value={newCustomer.email}
            onChange={handleInputChange}
            fullWidth
            margin='normal'
            error={!!errors.email}
            helperText={errors.email}
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            required
          />
          <TextField
            label='Address'
            name='address'
            value={newCustomer.address}
            onChange={handleInputChange}
            fullWidth
            margin='normal'
            error={!!errors.address}
            helperText={errors.address}
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            required
          />
          <FormControl
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!errors.firm}
          >
            <InputLabel sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Firm
            </InputLabel>
            <Select
              name='firm'
              value={newCustomer.firm}
              onChange={handleInputChange}
              label='Firm'
              sx={{
                '& .MuiSelect-select': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              }}
            >
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
            {errors.firm && (
              <Typography
                color='error'
                variant='caption'
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
              >
                {errors.firm}
              </Typography>
            )}
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              onClick={handleCloseModal}
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
              variant='contained'
              onClick={handleAddCustomer}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                '&:hover': { bgcolor: theme.palette.primary.dark },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                width: { xs: '100%', sm: 'auto' },
                textTransform: 'none',
              }}
            >
              Add Customer
            </Button>
          </Box>
        </Box>
      </Modal>

      {loading ? (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          sx={{ display: 'flex', justifyContent: 'center', py: { xs: 2, sm: 4 } }}
        >
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <motion.div variants={tableVariants} initial='hidden' animate='visible'>
          <TableContainer
            component={Paper}
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '&:hover': { boxShadow: theme.shadows[8] },
              overflowX: 'auto',
              [theme.breakpoints.down('sm')]: {
                '& .MuiTableCell-root': { display: 'block', width: '100%', boxSizing: 'border-box', p: 1 },
                '& .MuiTableRow-root': { display: 'block', mb: 2, borderBottom: `1px solid ${theme.palette.divider}` },
              },
            }}
          >
            <Table sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
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
                    },
                  }}
                >
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 150 } }}>Name</TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 120 } }}>Contact</TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 150 }, display: { xs: 'none', sm: 'table-cell' } }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 150 }, display: { xs: 'none', md: 'table-cell' } }}>
                    Address
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 100 }, display: { xs: 'none', md: 'table-cell' } }}>
                    Firm
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 150 } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{
                        textAlign: 'center',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        color: theme.palette.text.secondary,
                        py: 2,
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
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                          transition: 'all 0.3s ease',
                        },
                        '& td': {
                          borderBottom: { xs: 'none', sm: `1px solid ${theme.palette.divider}` },
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          px: { xs: 1, sm: 2 },
                        },
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary }}>{customer.name}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>{customer.contact}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary, display: { xs: 'none', sm: 'table-cell' } }}>
                        {customer.email}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary, display: { xs: 'none', md: 'table-cell' } }}>
                        {customer.address}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary, display: { xs: 'none', md: 'table-cell' } }}>
                        {customer.firm?.name || 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'block', sm: 'flex' },
                          gap: { xs: 0.5, sm: 1 },
                        }}
                      >
                        <Tooltip title='Edit functionality coming soon'>
                          <span>
                            <Button
                              variant='outlined'
                              size='small'
                              sx={{
                                color: theme.palette.secondary.main,
                                borderColor: theme.palette.secondary.main,
                                '&:hover': {
                                  bgcolor: theme.palette.action.hover,
                                  borderColor: theme.palette.secondary.dark,
                                },
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                px: { xs: 0.5, sm: 1 },
                                textTransform: 'none',
                                mr: { xs: 0, sm: 1 },
                                mb: { xs: 0.5, sm: 0 },
                              }}
                              disabled
                            >
                              Edit
                            </Button>
                          </span>
                        </Tooltip>
                        <Button
                          variant='outlined'
                          size='small'
                          color='error'
                          startIcon={<Delete fontSize='small' />}
                          onClick={() => handleDeleteCustomer(customer._id)}
                          sx={{
                            borderColor: theme.palette.error.main,
                            '&:hover': {
                              bgcolor: theme.palette.error.light,
                              borderColor: theme.palette.error.dark,
                            },
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            px: { xs: 0.5, sm: 1 },
                            textTransform: 'none',
                          }}
                        >
                          Delete
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
              textAlign: 'center',
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            }}
          >
            Page 1 of 1
          </Box>
        </motion.div>
      )}

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

export default CustomerManagement;