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
  TextField,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Add, Delete, Close } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setError as setAuthError } from '../redux/authSlice';
import { ROUTES } from '../utils/routes';
import api from '../utils/api';
import NotificationModal from '../components/NotificationModal'; 

function FirmManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newFirm, setNewFirm] = useState({
    logo: null,
    name: '',
    location: '',
    size: '',
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

  const fetchFirms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/getAllFirms');
      setFirms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('GetFirms error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 401
          ? 'Please log in to view firms.'
          : err.response?.data?.message || 'Failed to load firms.';
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
    fetchFirms();
  }, [fetchFirms]);

  const validateForm = (firm) => {
    const errors = {};
    if (!firm.name.trim()) errors.name = 'Name is required';
    if (!firm.location.trim()) errors.location = 'Location is required';
    if (!firm.size.trim()) errors.size = 'Size is required';
    if (!firm.logo) errors.logo = 'Logo is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddFirm = () => {
    if (!currentUser) {
      setNotificationDialog({
        open: true,
        message: 'Please log in to add firms.',
        type: 'error',
        title: 'Authentication Required',
      });
      dispatch(setAuthError('Please log in to add firms.'));
      navigate(ROUTES.LOGIN);
      return;
    }
    setNewFirm({ logo: null, name: '', location: '', size: '' });
    setFormErrors({});
    setOpenAddModal(true);
  };

  const handleDeleteFirm = async (firmId) => {
    if (!window.confirm('Are you sure you want to delete this firm?')) return;
    try {
      setLoading(true);
      await api.get(`/removeFirm?firmId=${firmId}`);
      setFirms(firms.filter((firm) => firm._id !== firmId));
      setNotificationDialog({ open: true, message: 'Firm deleted successfully!', type: 'success', title: 'Success' });
    } catch (err) {
      console.error('DeleteFirm error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage = err.response?.data?.message || 'Failed to delete firm.';
      setNotificationDialog({ open: true, message: errorMessage, type: 'error', title: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setNewFirm({
      ...newFirm,
      [name]: files ? files[0] : value,
    });
    setFormErrors({ ...formErrors, [name]: null, submit: null });
  };

  const handleSaveFirm = useCallback(async () => {
    if (!validateForm(newFirm)) {
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
      formData.append('logo', newFirm.logo);
      formData.append('name', newFirm.name);
      formData.append('location', newFirm.location);
      formData.append('size', newFirm.size);

      const response = await api.post('/createFirm', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchFirms();
      setOpenAddModal(false);
      setNewFirm({ logo: null, name: '', location: '', size: '' });
      setFormErrors({});
      setNotificationDialog({ open: true, message: 'Firm added successfully!', type: 'success', title: 'Success' });
    } catch (err) {
      console.error('CreateFirm error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage = err.response?.data?.message || 'Failed to add firm.';
      setFormErrors({ submit: errorMessage });
      setNotificationDialog({ open: true, message: errorMessage, type: 'error', title: 'Error' });
    } finally {
      setLoading(false);
    }
  }, [newFirm, fetchFirms]);

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewFirm({ logo: null, name: '', location: '', size: '' });
    setFormErrors({});
  };

  const handleNotificationClose = () => {
    setNotificationDialog({ ...notificationDialog,

 open: false });
  };

  const filteredFirms = useMemo(
    () =>
      firms.filter(
        (firm) =>
          firm &&
          ((firm.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (firm.location || '').toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [firms, searchQuery]
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
        initial="hidden"
        animate="visible"
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
          Firm Management
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
            onClick={handleAddFirm}
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
            Add Firm
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
              placeholder="Search firms..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
        </Box>
      </Box>

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
      ) : filteredFirms.length === 0 ? (
        <Typography
          sx={{
            color: theme.palette.text.primary,
            textAlign: 'center',
            py: { xs: 2, sm: 4 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
          }}
        >
          No firms found.
        </Typography>
      ) : (
        <motion.div variants={tableVariants} initial="hidden" animate="visible">
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
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 100 } }}>Logo</TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 150 } }}>Firm Name</TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 150 } }}>Location</TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 100 }, display: { xs: 'none', md: 'table-cell' } }}>
                    Size
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: 'auto', sm: 100 } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFirms.map((firm) => (
                  <TableRow
                    key={firm._id}
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
                    <TableCell>
                      {firm.logo ? (
                        <Box
                          sx={{
                            width: { xs: 40, sm: 50 },
                            height: { xs: 40, sm: 50 },
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={`http://localhost:3002/${firm.logo}`}
                            alt={`${firm.name || 'Firm'} logo`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                            onError={(e) => {
                              console.error(`Failed to load logo: ${firm.logo}`);
                              e.target.src = '/fallback-logo.png';
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography sx={{ color: theme.palette.text.secondary }}>No Logo</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{firm.name}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{firm.location}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary, display: { xs: 'none', md: 'table-cell' } }}>
                      {firm.size}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete fontSize="small" />}
                        onClick={() => handleDeleteFirm(firm._id)}
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
                ))}
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
            Page 1
          </Box>
        </motion.div>
      )}

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
          Add New Firm
          <IconButton
            onClick={handleCancel}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              p: { xs: 0.5, sm: 1 },
            }}
          >
            <Close sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          {formErrors.submit && (
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
              {formErrors.submit}
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Firm Name"
            type="text"
            fullWidth
            value={newFirm.name}
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
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            value={newFirm.location}
            onChange={handleInputChange}
            error={!!formErrors.location}
            helperText={formErrors.location}
            sx={{
              mb: { xs: 1, sm: 2 },
              '& .MuiInputBase-input': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
              '& .MuiInputLabel-root': { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
            }}
            required
          />
          <TextField
            margin="dense"
            name="size"
            label="Size"
            type="text"
            fullWidth
            value={newFirm.size}
            onChange={handleInputChange}
            error={!!formErrors.size}
            helperText={formErrors.size}
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
              Upload Logo
              <input
                type="file"
                hidden
                name="logo"
                onChange={handleInputChange}
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
              {newFirm.logo ? newFirm.logo.name : 'No file chosen'}
            </Typography>
            {newFirm.logo && (
              <img
                src={URL.createObjectURL(newFirm.logo)}
                alt="Logo preview"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 4,
                  marginTop: 8,
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  console.error('Failed to preview logo');
                  e.target.src = '/fallback-logo.png';
                }}
              />
            )}
            {formErrors.logo && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, mt: 1 }}
              >
                {formErrors.logo}
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
              color: theme.palette.text.primary,
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveFirm}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              '&:hover': { bgcolor: theme.palette.primary.dark },
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              textTransform: 'none',
            }}
          >
            Save Firm
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

export default FirmManagement;