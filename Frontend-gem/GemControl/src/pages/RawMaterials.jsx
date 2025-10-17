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
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Pagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { OptimizedImage } from '../utils/imageUtils';
import { Search, Add, Delete, UploadFile, Close } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError as setAuthError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";
import api, { BASE_URL } from "../utils/api";
import NotificationModal from "../components/NotificationModal";

function RawMaterials() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [firmFilter, setFirmFilter] = useState("all");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openStockModal, setOpenStockModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: "",
    type: "info",
    title: "",
  });
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
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [materialResponse, firmResponse] = await Promise.all([
        api.get("/getAllRawMaterials"),
        api.get("/getAllFirms"),
      ]);
      setMaterials(
        Array.isArray(materialResponse.data) ? materialResponse.data : []
      );
      setFirms(Array.isArray(firmResponse.data) ? firmResponse.data : []);
    } catch (err) {
      console.error("FetchData error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to view raw materials."
          : err.response?.data?.message || "Failed to load data.";
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
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
      setNotificationDialog({
        open: true,
        message: "Please log in to add materials.",
        type: "error",
        title: "Authentication Required",
      });
      dispatch(setAuthError("Please log in to add materials."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setNewMaterial({
      name: "",
      materialType: "gold",
      weight: "",
      firm: "",
      rawmaterialImg: null,
    });
    setFormErrors({});
    setOpenAddModal(true);
  };

  const handleAddStock = (materialId) => {
    if (!currentUser) {
      setNotificationDialog({
        open: true,
        message: "Please log in to update stock.",
        type: "error",
        title: "Authentication Required",
      });
      dispatch(setAuthError("Please log in to update stock."));
      navigate(ROUTES.LOGIN);
      return;
    }
    setStockUpdate({ rawMaterialId: materialId, weight: "" });
    setFormErrors({});
    setOpenStockModal(true);
  };

  const handleImportFile = () => {
    setOpenImportModal(true);
  };

  const handleImportCancel = () => {
    setOpenImportModal(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleFirmChange = (e) => {
    setFirmFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
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

  const handleSaveMaterial = useCallback(async () => {
    if (!validateForm()) {
      setNotificationDialog({
        open: true,
        message: "Please correct the form errors.",
        type: "error",
        title: "Validation Error",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", newMaterial.name);
      formData.append("materialType", newMaterial.materialType);
      formData.append("weight", newMaterial.weight);
      formData.append("firm", newMaterial.firm);
      formData.append("rawMaterial", newMaterial.rawmaterialImg);

      await api.post("/createRawMaterial", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchData();
      setOpenAddModal(false);
      setNewMaterial({
        name: "",
        materialType: "gold",
        weight: "",
        firm: "",
        rawmaterialImg: null,
      });
      setFormErrors({});
      setNotificationDialog({
        open: true,
        message: "Material added successfully!",
        type: "success",
        title: "Success",
      });
    } catch (err) {
      console.error("CreateMaterial error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to add materials."
          : err.response?.status === 403
            ? "Admin access required to add materials."
            : err.response?.data?.message || "Failed to add material.";
      setFormErrors({ submit: errorMessage });
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
      dispatch(setAuthError(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [newMaterial, fetchData, dispatch]);

  const handleSaveStock = useCallback(async () => {
    if (!validateStockForm()) {
      setNotificationDialog({
        open: true,
        message: "Please correct the form errors.",
        type: "error",
        title: "Validation Error",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post("/AddRawMaterialStock", {
        rawMaterialId: stockUpdate.rawMaterialId,
        weight: stockUpdate.weight,
      });
      await fetchData();
      setOpenStockModal(false);
      setStockUpdate({ rawMaterialId: "", weight: "" });
      setFormErrors({});
      setNotificationDialog({
        open: true,
        message: "Stock updated successfully!",
        type: "success",
        title: "Success",
      });
    } catch (err) {
      console.error("AddStock error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.status === 401
          ? "Please log in to update stock."
          : err.response?.status === 403
            ? "Admin access required to update stock."
            : err.response?.data?.message || "Failed to update stock.";
      setFormErrors({ submit: errorMessage });
      setNotificationDialog({
        open: true,
        message: errorMessage,
        type: "error",
        title: "Error",
      });
      dispatch(setAuthError(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [stockUpdate, fetchData, dispatch]);

  const handleRemoveMaterial = async (rawMaterialId) => {
    if (!window.confirm("Are you sure you want to remove this material?"))
      return;
    try {
      setLoading(true);
      await api.get(`/removeRawMaterial?rawMaterialId=${rawMaterialId}`);
      setMaterials(materials.filter((m) => m._id !== rawMaterialId));
      setNotificationDialog({
        open: true,
        message: "Material removed successfully!",
        type: "success",
        title: "Success",
      });
    } catch (err) {
      console.error("RemoveMaterial error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setNotificationDialog({
        open: true,
        message: err.response?.data?.message || "Failed to remove material.",
        type: "error",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClose = () => {
    setNotificationDialog({ ...notificationDialog, open: false });
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

  const filteredMaterials = useMemo(
    () =>
      materials.filter(
        (material) =>
          (material.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          (firmFilter === "all" || material.firm?._id === firmFilter)
      ),
    [materials, searchQuery, firmFilter]
  );

  const paginatedMaterials = useMemo(
    () =>
      filteredMaterials.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredMaterials, page]
  );



  return (
    <Box
      sx={{
        maxWidth: "100%",
        margin: "0 auto",
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 },
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
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
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 2 },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: "bold",
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              textAlign: { xs: "center", sm: "left" },
              mb: { xs: 1, sm: 0 },
            }}
          >
            Raw Materials Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 2 },
              width: { xs: "100%", sm: "auto" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddMaterial}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(
                  theme.palette.primary.main
                ),
                "&:hover": { bgcolor: theme.palette.primary.dark },
                borderRadius: 1,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                width: { xs: "100%", sm: "auto" },
                textTransform: "none",
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
                color: theme.palette.getContrastText(
                  theme.palette.secondary.main
                ),
                "&:hover": { bgcolor: theme.palette.secondary.dark },
                borderRadius: 1,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                width: { xs: "100%", sm: "auto" },
                textTransform: "none",
              }}
            >
              Import File
            </Button>
            <Paper
              sx={{
                p: "4px 8px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 200, md: 250 },
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <IconButton sx={{ p: { xs: 0.5, sm: 1 } }}>
                <Search sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              </IconButton>
              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
                placeholder="Search materials..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </Paper>
            <Select
              value={firmFilter}
              onChange={handleFirmChange}
              sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                width: { xs: "100%", sm: 150 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "& .MuiSelect-select": { py: 1 },
              }}
              variant="outlined"
            >
              <MenuItem
                value="all"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                All Firms
              </MenuItem>
              {firms.map((firm) => (
                <MenuItem
                  key={firm._id}
                  value={firm._id}
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {firm.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        <motion.div variants={tableVariants} initial="hidden" animate="visible">
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: { xs: 2, sm: 3 },
              }}
            >
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : filteredMaterials.length === 0 ? (
            <Typography
              sx={{
                color: theme.palette.text.primary,
                textAlign: "center",
                py: { xs: 2, sm: 3 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              No materials found.
            </Typography>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <Box sx={{ display: { xs: "block", sm: "none" } }}>
                {paginatedMaterials.map((material) => (
                  <Card
                    key={material._id}
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      boxShadow: theme.shadows[2],
                      "&:hover": { boxShadow: theme.shadows[4] },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                      <Box
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        {material.rawmaterialImg ? (
                          <OptimizedImage
                            src={material.rawmaterialImg}
                            alt={material.name || "Material"}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "contain",
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: theme.palette.text.secondary,
                            }}
                          >
                            No Image
                          </Typography>
                        )}
                        <Box>
                          <Typography
                            sx={{ fontSize: "0.875rem", fontWeight: "bold" }}
                          >
                            {material.name || "N/A"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem" }}>
                            Type: {material.materialType || "N/A"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem" }}>
                            Firm: {material.firm?.name || "N/A"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem" }}>
                            Weight: {material.weight || "0"} g
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem" }}>
                            Code: {material.RawMaterialcode || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions
                      sx={{
                        p: 1,
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        disabled
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          textTransform: "none",
                          m: 0.5,
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Delete fontSize="small" />}
                        onClick={() => handleRemoveMaterial(material._id)}
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          textTransform: "none",
                          m: 0.5,
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddStock(material._id)}
                        sx={{
                          fontSize: "0.75rem",
                          px: 1,
                          textTransform: "none",
                          m: 0.5,
                        }}
                      >
                        Add Stock
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>

              {/* Desktop Table Layout */}
              <TableContainer
                component={Paper}
                sx={{
                  display: { xs: "none", sm: "block" },
                  width: "100%",
                  overflowX: "auto",
                  borderRadius: 1,
                  boxShadow: theme.shadows[2],
                }}
              >
                <Table
                  sx={{
                    minWidth: 650,
                    "& .MuiTableCell-root": {
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        "& th": {
                          fontWeight: "bold",
                          borderBottom: `2px solid ${theme.palette.secondary.main}`,
                          px: { xs: 1, sm: 2 },
                          py: 1,
                        },
                      }}
                    >
                      <TableCell sx={{ minWidth: 100 }}>Image</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Name</TableCell>
                      <TableCell
                        sx={{
                          minWidth: 120,
                          display: { xs: "none", sm: "table-cell" },
                        }}
                      >
                        Material Type
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: 120,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        Firm
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>Weight (g)</TableCell>
                      <TableCell
                        sx={{
                          minWidth: 100,
                          display: { xs: "none", md: "table-cell" },
                        }}
                      >
                        Code
                      </TableCell>
                      <TableCell sx={{ minWidth: 200 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMaterials.map((material) => (
                      <TableRow
                        key={material._id}
                        sx={{
                          "&:hover": { bgcolor: theme.palette.action.hover },
                          "& td": {
                            px: { xs: 1, sm: 2 },
                            py: 1,
                          },
                        }}
                      >
                        <TableCell>
                          {material.rawmaterialImg ? (
                            <Box
                              sx={{
                                width: { xs: 40, sm: 50 },
                                height: { xs: 40, sm: 50 },
                                borderRadius: 1,
                                overflow: "hidden",
                              }}
                            >
                              <OptimizedImage
                                src={material.rawmaterialImg}
                                alt={material.name || "Material"}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: "0.75rem" }}>
                              No Image
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{material.name || "N/A"}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", sm: "table-cell" } }}
                        >
                          {material.materialType || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          {material.firm?.name || "N/A"}
                        </TableCell>
                        <TableCell>{material.weight || "0"}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          {material.RawMaterialcode || "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                        >
                          <Tooltip title="Edit functionality coming soon">
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                disabled
                                sx={{
                                  fontSize: "0.75rem",
                                  px: 1,
                                  textTransform: "none",
                                }}
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
                            onClick={() => handleRemoveMaterial(material._id)}
                            sx={{
                              fontSize: "0.75rem",
                              px: 1,
                              textTransform: "none",
                            }}
                          >
                            Remove
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAddStock(material._id)}
                            sx={{
                              fontSize: "0.75rem",
                              px: 1,
                              textTransform: "none",
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
              {filteredMaterials.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Typography
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Total Materials: {filteredMaterials.length}
                  </Typography>
                  <Pagination
                    count={Math.ceil(filteredMaterials.length / itemsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      },
                    }}
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
            width: { xs: "95%", sm: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: 1,
            position: "relative",
          }}
        >
          Add New Material
          <IconButton
            onClick={handleCancel}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
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
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {formErrors.submit}
            </Box>
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
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
            required
          />
          <Select
            name="materialType"
            value={newMaterial.materialType}
            onChange={handleInputChange}
            fullWidth
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiSelect-select": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
            error={!!formErrors.materialType}
            required
          >
            <MenuItem
              value="gold"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Gold
            </MenuItem>
            <MenuItem
              value="silver"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Silver
            </MenuItem>
            <MenuItem
              value="platinum"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Platinum
            </MenuItem>
            <MenuItem
              value="diamond"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Diamond
            </MenuItem>
            <MenuItem
              value="other"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Other
            </MenuItem>
          </Select>
          <Select
            name="firm"
            value={newMaterial.firm}
            onChange={handleInputChange}
            fullWidth
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiSelect-select": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
            error={!!formErrors.firm}
            required
          >
            <MenuItem
              value=""
              disabled
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Select Firm
            </MenuItem>
            {firms.map((firm) => (
              <MenuItem
                key={firm._id}
                value={firm._id}
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
            required
          />
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            <Button
              variant="contained"
              component="label"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.getContrastText(
                  theme.palette.secondary.main
                ),
                "&:hover": { bgcolor: theme.palette.secondary.dark },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                width: { xs: "100%", sm: "auto" },
                textTransform: "none",
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
                  width: 60,
                  height: 60,
                  borderRadius: 4,
                  marginTop: 8,
                  objectFit: "contain",
                }}
                onError={(e) => (e.target.src = "/fallback-image.png")}
              />
            )}
            {formErrors.rawmaterialImg && (
              <Typography
                color="error"
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, mt: 1 }}
              >
                {formErrors.rawmaterialImg}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            p: 1,
          }}
        >
          <Button
            onClick={handleCancel}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveMaterial}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
          >
            Save Material
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openStockModal}
        onClose={handleStockCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: 1,
            position: "relative",
          }}
        >
          Add Stock to Material
          <IconButton
            onClick={handleStockCancel}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
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
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {formErrors.submit}
            </Box>
          )}
          <Select
            name="rawMaterialId"
            value={stockUpdate.rawMaterialId}
            onChange={handleStockInputChange}
            fullWidth
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiSelect-select": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
            error={!!formErrors.rawMaterialId}
            disabled
          >
            <MenuItem
              value={stockUpdate.rawMaterialId}
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {materials.find((m) => m._id === stockUpdate.rawMaterialId)
                ?.name || "Selected Material"}
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
            sx={{
              mb: { xs: 1, sm: 2 },
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
              "& .MuiInputLabel-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
            required
          />
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            p: 1,
          }}
        >
          <Button
            onClick={handleStockCancel}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveStock}
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              "&:hover": { bgcolor: theme.palette.primary.dark },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
          >
            Save Stock
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openImportModal}
        onClose={handleImportCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: "95%", sm: 500 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main),
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: 1,
            position: "relative",
          }}
        >
          Import Materials
          <IconButton
            onClick={handleImportCancel}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              p: 0.5,
            }}
            aria-label="Close dialog"
          >
            <Close sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              textAlign: "center",
            }}
          >
            Import functionality is not yet implemented.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            p: 1,
          }}
        >
          <Button
            onClick={handleImportCancel}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
            }}
          >
            Close
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

export default RawMaterials;
