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
import { useState, useEffect } from "react";
import { Search, Add, Delete, UploadFile } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api, { BASE_URL } from "../utils/api";

function RawMaterials() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [materialType, setMaterialType] = useState("all");
  const [firmFilter, setFirmFilter] = useState("all");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openStockModal, setOpenStockModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    materialType: "gold",
    weight: "",
    firm: "",
    rawmaterialImg: null,
  });
  const [stockUpdate, setStockUpdate] = useState({
    rawMaterialId: "",
    weight: "",
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const materialResponse = await api.get("/getAllRawMaterials");
        setMaterials(
          Array.isArray(materialResponse.data) ? materialResponse.data : []
        );
        const firmResponse = await api.get("/getAllFirms");
        setFirms(Array.isArray(firmResponse.data) ? firmResponse.data : []);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Please log in to view raw materials.");
          dispatch(setAuthError("Please log in to view raw materials."));
          navigate(ROUTES.LOGIN);
        } else {
          setError(err.response?.data?.message || "Failed to load data.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!newMaterial.name.trim()) errors.name = "Material name is required";
    if (!newMaterial.materialType)
      errors.materialType = "Material type is required";
    if (
      !newMaterial.weight ||
      isNaN(newMaterial.weight) ||
      newMaterial.weight <= 0
    )
      errors.weight = "Valid weight is required";
    if (!newMaterial.firm) errors.firm = "Firm is required";
    if (!newMaterial.rawmaterialImg)
      errors.rawmaterialImg = "Image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStockForm = () => {
    const errors = {};
    if (!stockUpdate.rawMaterialId)
      errors.rawMaterialId = "Material selection is required";
    if (
      !stockUpdate.weight ||
      isNaN(stockUpdate.weight) ||
      stockUpdate.weight <= 0
    )
      errors.weight = "Valid weight is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMaterial = () => {
    if (!currentUser) {
      setError("Please log in to add materials.");
      dispatch(setAuthError("Please log in to add materials."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setOpenAddModal(true);
  };

  const handleAddStock = (materialId) => {
    if (!currentUser) {
      setError("Please log in to update stock.");
      dispatch(setAuthError("Please log in to update stock."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setStockUpdate({ rawMaterialId: materialId, weight: "" });
    setOpenStockModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMaterialTypeChange = (e) => {
    setMaterialType(e.target.value);
  };

  const handleFirmChange = (e) => {
    setFirmFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial({ ...newMaterial, [name]: value });
    setFormErrors({ ...formErrors, [name]: null, submit: null });
  };

  const handleStockInputChange = (e) => {
    const { name, value } = e.target;
    setStockUpdate({ ...stockUpdate, [name]: value });
    setFormErrors({ ...formErrors, [name]: null, submit: null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMaterial({ ...newMaterial, rawmaterialImg: file });
      setFormErrors({ ...formErrors, rawmaterialImg: null, submit: null });
    }
  };

  const handleSaveMaterial = async () => {
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("name", newMaterial.name);
      formData.append("materialType", newMaterial.materialType);
      formData.append("weight", newMaterial.weight);
      formData.append("firm", newMaterial.firm);
      formData.append("rawMaterial", newMaterial.rawmaterialImg);

      const response = await api.post("/createRawMaterial", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMaterials([...materials, response.data.rawMaterial]);
      setOpenAddModal(false);
      setNewMaterial({
        name: "",
        materialType: "gold",
        weight: "",
        firm: "",
        rawmaterialImg: null,
      });
      setFormErrors({});
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to add materials."
          : err.response?.status === 403
          ? "Admin access required to add materials."
          : err.response?.data?.message || "Failed to add material.";
      setFormErrors({ submit: errorMessage });
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleSaveStock = async () => {
    if (!validateStockForm()) return;

    try {
      const response = await api.post("/AddRawMaterialStock", {
        rawMaterialId: stockUpdate.rawMaterialId,
        weight: stockUpdate.weight,
      });
      setMaterials(
        materials.map((m) =>
          m._id === stockUpdate.rawMaterialId ? response.data.rawMaterial : m
        )
      );
      setOpenStockModal(false);
      setStockUpdate({ rawMaterialId: "", weight: "" });
      setFormErrors({});
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to update stock."
          : err.response?.status === 403
          ? "Admin access required to update stock."
          : err.response?.data?.message || "Failed to update stock.";
      setFormErrors({ submit: errorMessage });
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleRemoveMaterial = async (rawMaterialId) => {
    if (!window.confirm("Are you sure you want to remove this material?"))
      return;
    try {
      await api.get(`/removeRawMaterial?rawMaterialId=${rawMaterialId}`);
      setMaterials(materials.filter((m) => m._id !== rawMaterialId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove material.");
    }
  };

  const handleImportFile = () => {
    alert("Import File functionality to be implemented!");
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    setNewMaterial({
      name: "",
      materialType: "gold",
      weight: "",
      firm: "",
      rawmaterialImg: null,
    });
    setFormErrors({});
  };

  const handleStockCancel = () => {
    setOpenStockModal(false);
    setStockUpdate({ rawMaterialId: "", weight: "" });
    setFormErrors({});
  };

  const filteredMaterials = materials.filter(
    (material) =>
      (material.name || "").toLowerCase().includes(searchQuery.toLowerCase()) &&
      (materialType === "all" || material.materialType === materialType) &&
      (firmFilter === "all" || material.firm?._id === firmFilter)
  );

  const getImageUrl = (rawmaterialImg) => {
    if (!rawmaterialImg) return "/fallback-image.png";
    return `${BASE_URL}/${rawmaterialImg
      .replace(/^.*[\\\/]Uploads[\\\/]/, "Uploads/")
      .replace(/\\/g, "/")}`;
  };

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
          Raw Materials Management
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
            onClick={handleAddMaterial}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Add Material
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadFile />}
            onClick={handleImportFile}
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.secondary.dark },
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Import File
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
              placeholder="Search materials..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={materialType}
            onChange={handleMaterialTypeChange}
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
            <MenuItem value="all" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              All Types
            </MenuItem>
            <MenuItem value="gold" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Gold
            </MenuItem>
            <MenuItem value="silver" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Silver
            </MenuItem>
            <MenuItem value="platinum" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Platinum
            </MenuItem>
            <MenuItem value="diamond" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Diamond
            </MenuItem>
            <MenuItem value="other" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Other
            </MenuItem>
          </Select>
          <Select
            value={firmFilter}
            onChange={handleFirmChange}
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
            <MenuItem value="all" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              All Firms
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
        ) : filteredMaterials.length === 0 ? (
          <Typography
            sx={{
              color: theme.palette.text.primary,
              textAlign: "center",
              py: { xs: 2, sm: 4 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            No materials found.
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
                  <TableCell>Name</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Material Type
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Firm
                  </TableCell>
                  <TableCell>Weight (g)</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Code
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow
                    key={material._id}
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
                      {material.rawmaterialImg ? (
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
                         src={getImageUrl(material.rawmaterialImg)}
                         alt={material.name || "Material"}
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
                      {material.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {material.materialType}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {material.firm?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {material.weight || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {material.RawMaterialcode}
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
                        onClick={() => handleRemoveMaterial(material._id)}
                        sx={{
                          borderColor: theme.palette.error.main,
                          "&:hover": {
                            bgcolor: theme.palette.error.light,
                            borderColor: theme.palette.error.dark,
                          },
                          mr: 1,
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          px: { xs: 0.5, sm: 1 },
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddStock(material._id)}
                        sx={{
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                            borderColor: theme.palette.primary.dark,
                          },
                          fontSize: { xs: "0.7rem", sm: "0.8rem" },
                          px: { xs: 0.5, sm: 1 },
                        }}
                      >
                        Add Stock
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
          Add New Material
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
            label="Material Name"
            type="text"
            fullWidth
            value={newMaterial.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
          />
          <Select
            name="materialType"
            value={newMaterial.materialType}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!formErrors.materialType}
            required
          >
            <MenuItem value="gold" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Gold
            </MenuItem>
            <MenuItem value="silver" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Silver
            </MenuItem>
            <MenuItem value="platinum" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Platinum
            </MenuItem>
            <MenuItem value="diamond" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Diamond
            </MenuItem>
            <MenuItem value="other" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
              Other
            </MenuItem>
          </Select>
          <Select
            name="firm"
            value={newMaterial.firm}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!formErrors.firm}
            required
          >
            <MenuItem value="" disabled sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
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
            name="weight"
            label="Weight (g)"
            type="number"
            fullWidth
            value={newMaterial.weight}
            onChange={handleInputChange}
            error={!!formErrors.weight}
            helperText={formErrors.weight}
            sx={{ mb: { xs: 1, sm: 2 } }}
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
                name="rawMaterial"
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
              {newMaterial.rawmaterialImg
                ? newMaterial.rawmaterialImg.name
                : "No file chosen"}
            </Typography>
            {newMaterial.rawmaterialImg && (
              <img
                src={URL.createObjectURL(newMaterial.rawmaterialImg)}
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
            {formErrors.rawmaterialImg && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
              >
                {formErrors.rawmaterialImg}
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
            onClick={handleSaveMaterial}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Save Material
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openStockModal} onClose={handleStockCancel} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Add Stock to Material
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
          <Select
            name="rawMaterialId"
            value={stockUpdate.rawMaterialId}
            onChange={handleStockInputChange}
            fullWidth
            sx={{ mb: { xs: 1, sm: 2 } }}
            error={!!formErrors.rawMaterialId}
            disabled
          >
            <MenuItem
              value={stockUpdate.rawMaterialId}
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
            >
              {materials.find((m) => m._id === stockUpdate.rawMaterialId)?.name ||
                "Selected Material"}
            </MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="weight"
            label="Additional Weight (g)"
            type="number"
            fullWidth
            value={stockUpdate.weight}
            onChange={handleStockInputChange}
            error={!!formErrors.weight}
            helperText={formErrors.weight}
            sx={{ mb: { xs: 1, sm: 2 } }}
            required
          />
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Button
            onClick={handleStockCancel}
            sx={{
              color: theme.palette.text.primary,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveStock}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Save Stock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RawMaterials;