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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Add, UploadFile } from "@mui/icons-material";

function RawMaterials() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [materialType, setMaterialType] = useState("all");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    type: "",
    purity: "",
    carat: "",
    clarity: "",
    color: "",
    cut: "",
    weight: "",
    cost: "",
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
  const materials = [
    {
      id: 1,
      type: "Gold",
      purity: "99.9%",
      carat: "24K",
      clarity: "N/A",
      color: "Yellow",
      cut: "N/A",
      weight: "10",
      cost: "5000",
    },
    {
      id: 2,
      type: "Silver",
      purity: "92.5%",
      carat: "N/A",
      clarity: "N/A",
      color: "White",
      cut: "N/A",
      weight: "50",
      cost: "3000",
    },
    {
      id: 3,
      type: "Diamond",
      purity: "N/A",
      carat: "1",
      clarity: "VVS1",
      color: "D",
      cut: "Excellent",
      weight: "0.2",
      cost: "120000",
    },
  ];

  const filteredMaterials = materials.filter(
    (material) =>
      material.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.clarity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.color?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMaterial = () => {
    setOpenAddModal(true);
  };

  const handleImportFile = () => {
    alert("Import File functionality to be implemented!");
  };

  const handleInputChange = (e) => {
    setNewMaterial({ ...newMaterial, [e.target.name]: e.target.value });
  };

  const handleSaveMaterial = () => {
    console.log("New Material:", newMaterial);
    setOpenAddModal(false);
    setNewMaterial({
      name: "",
      type: "",
      purity: "",
      carat: "",
      clarity: "",
      color: "",
      cut: "",
      weight: "",
      cost: "",
    });
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewMaterial({
      name: "",
      type: "",
      purity: "",
      carat: "",
      clarity: "",
      color: "",
      cut: "",
      weight: "",
      cost: "",
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
          Raw Materials Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddMaterial}
            sx={{
              bgcolor: theme.palette.primary.main, // #C99314
              color: theme.palette.text.primary, // #A76E19
              "&:hover": { bgcolor: "#b5830f" },
              borderRadius: 2,
            }}
          >
            Add Material
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadFile />}
            onClick={handleImportFile}
            sx={{
              bgcolor: theme.palette.secondary.main, // #DA9B48
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#c2833a" },
              borderRadius: 2,
            }}
          >
            Import File
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
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>
          <Select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="Gold">Gold</MenuItem>
            <MenuItem value="Silver">Silver</MenuItem>
            <MenuItem value="Diamond">Diamond</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Materials Table */}
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
                <TableCell>Type</TableCell>
                <TableCell>Purity (%)</TableCell>
                <TableCell>Carat</TableCell>
                <TableCell>Clarity</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Cut</TableCell>
                <TableCell>Weight (g)</TableCell>
                <TableCell>Cost (₹)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow
                  key={material.id}
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
                    {material.id}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.type}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.purity}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.carat || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.clarity || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.color || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.cut || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.weight}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {material.cost}
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

      {/* Add Material Modal */}
      <Dialog open={openAddModal} onClose={handleCancel}>
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
          }}
        >
          Add New Material
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Material Name"
            type="text"
            fullWidth
            value={newMaterial.name}
            onChange={handleInputChange}
            sx={{ mb: 2, color: theme.palette.text.primary }}
          />
          <TextField
            margin="dense"
            name="type"
            label="Material Type"
            type="text"
            fullWidth
            value={newMaterial.type}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="purity"
            label="Purity (e.g., 24K, 925)"
            type="text"
            fullWidth
            value={newMaterial.purity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="weight"
            label="Weight (grams)"
            type="number"
            fullWidth
            value={newMaterial.weight}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="carat"
            label="Carat"
            type="text"
            fullWidth
            value={newMaterial.carat}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="clarity"
            label="Clarity (e.g., VVS1, VS2)"
            type="text"
            fullWidth
            value={newMaterial.clarity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="color"
            label="Color (e.g., D, E, F)"
            type="text"
            fullWidth
            value={newMaterial.color}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="cut"
            label="Cut (e.g., Excellent, Good)"
            type="text"
            fullWidth
            value={newMaterial.cut}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="cost"
            label="Cost"
            type="number"
            fullWidth
            value={newMaterial.cost}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
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
            onClick={handleSaveMaterial}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: "#b5830f" },
            }}
          >
            Save Material
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RawMaterials;
