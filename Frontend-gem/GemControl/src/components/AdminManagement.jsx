import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import api from "../utils/api";
import { setError } from "../redux/authSlice";
import { ROUTES } from "../utils/routes";

function AdminManagement() {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.auth.error);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/admin/GetallUsers");
        setUsers(response.data);
      } catch (err) {
        dispatch(
          setError(err.response?.data?.message || "Failed to fetch users")
        );
      }
    };
    fetchUsers();
  }, [dispatch]);

  const handleRemoveUser = async (userId) => {
    try {
      await api.get(`/api/admin/remove/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      dispatch(
        setError(err.response?.data?.message || "Failed to remove user")
      );
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleRemoveUser(user._id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AdminManagement;
