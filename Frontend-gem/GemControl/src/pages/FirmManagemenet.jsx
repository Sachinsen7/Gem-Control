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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Add } from "@mui/icons-material";
import axios from "axios";

function FirmManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newFirm, setNewFirm] = useState({
    logo: "",
    name: "",
    gstin: "",
    contact: "",
    address: "",
    bankDetails: "",
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

  // Fetch firms from backend
  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/firms");
        setFirms(response.data);
      } catch (err) {
        setError("Error loading firms");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFirms();
  }, []);

  const handleAddFirm = () => {
    setOpenAddModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    setNewFirm({ ...newFirm, [e.target.name]: e.target.value });
  };

  const handleSaveFirm = () => {
    console.log("New Firm:", newFirm);
    setOpenAddModal(false);
    setNewFirm({
      logo: "",
      name: "",
      gstin: "",
      contact: "",
      address: "",
      bankDetails: "",
    });
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewFirm({
      logo: "",
      name: "",
      gstin: "",
      contact: "",
      address: "",
      bankDetails: "",
    });
  };

  const filteredFirms = firms.filter(
    (firm) =>
      firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.gstin.toLowerCase().includes(searchQuery.toLowerCase())
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
          Firm Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddFirm}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Add Firm
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
              placeholder="Search firms..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
        </Box>
      </Box>

      {/* Firm Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : error ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: 4,
            }}
          >
            {error}
          </Typography>
        ) : (
          <>
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
                    <TableCell>Logo</TableCell>
                    <TableCell>Firm Name</TableCell>
                    <TableCell>GSTIN</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Bank Details</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFirms.map((firm) => (
                    <TableRow
                      key={firm.id}
                      sx={{
                        "&:hover": {
                          bgcolor: "#f1e8d0",
                          transition: "all 0.3s ease",
                        },
                        "& td": {
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.id}
                      </TableCell>
                      <TableCell>
                        <img
                          src={firm.logo || "https://via.placeholder.com/50"}
                          alt={`${firm.name} logo`}
                          style={{ width: 50, height: 50, borderRadius: 4 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.name}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.gstin}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.contact}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.address}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {firm.bankDetails}
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
          </>
        )}
      </motion.div>

      {/* Add Firm Modal */}
      <Dialog open={openAddModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Add New Firm
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Firm Name"
            type="text"
            fullWidth
            value={newFirm.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="gstin"
            label="GSTIN"
            type="text"
            fullWidth
            value={newFirm.gstin}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="contact"
            label="Contact"
            type="text"
            fullWidth
            value={newFirm.contact}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            type="text"
            fullWidth
            value={newFirm.address}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="bankDetails"
            label="Bank Details"
            type="text"
            fullWidth
            value={newFirm.bankDetails}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="logo"
            label="Logo URL"
            type="text"
            fullWidth
            value={newFirm.logo}
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
            onClick={handleSaveFirm}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Save Firm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FirmManagement;
