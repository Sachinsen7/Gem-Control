import {
  Typography,
  Grid,
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Add } from "@mui/icons-material";

function UserManagement() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

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
  const users = [
    {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
      lastLogin: "June 12, 2025 06:00 PM",
    },
    {
      id: 2,
      username: "jane_smith",
      email: "jane@example.com",
      role: "Manager",
      status: "Inactive",
      lastLogin: "June 11, 2025 03:30 PM",
    },
    {
      id: 3,
      username: "mike_ross",
      email: "mike@example.com",
      role: "Staff",
      status: "Active",
      lastLogin: "June 12, 2025 05:45 PM",
    },
    {
      id: 4,
      username: "admin_user",
      email: "admin@example.com",
      role: "Admin",
      status: "Active",
      lastLogin: "June 12, 2025 06:05 PM",
    },
    {
      id: 5,
      username: "staff_one",
      email: "staff@example.com",
      role: "Staff",
      status: "Inactive",
      lastLogin: "June 10, 2025 02:15 PM",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    alert("Add User functionality to be implemented!");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
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
          User Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
            sx={{
              bgcolor: theme.palette.primary.main, // #fffefa
              color: theme.palette.text.primary, // #033050
              "&:hover": { bgcolor: "#f8f7f0" }, // Slightly darker shade of #fffefa
              borderRadius: 2,
            }}
          >
            Add User
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Paper>
          <Select
            value={filterRole}
            onChange={handleFilterChange}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              ".MuiSelect-icon": { color: theme.palette.text.secondary },
            }}
            variant="outlined"
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* User Table */}
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
                    borderBottom: `2px solid ${theme.palette.secondary.main}`, // #d82939
                  },
                }}
              >
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    "&:hover": {
                      bgcolor: "#fefcf9", // Light variant of #fffefa
                      transition: "all 0.3s ease",
                    },
                    "& td": {
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {user.id}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {user.username}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {user.email}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {user.role}
                  </TableCell>
                  <TableCell
                    sx={{
                      color:
                        user.status === "Active"
                          ? "#4CAF50"
                          : theme.palette.secondary.main,
                    }}
                  >
                    {user.status}
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: theme.palette.secondary.main, // #d82939
                        borderColor: theme.palette.secondary.main,
                        "&:hover": {
                          bgcolor: "#fce6e8",
                          borderColor: "#a8202c",
                        }, // Light red background on hover
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
          Page 1 of 5
        </Box>
      </motion.div>
    </Box>
  );
}

export default UserManagement;
