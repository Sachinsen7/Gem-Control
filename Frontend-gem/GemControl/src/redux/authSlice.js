// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const loadFromLocalStorage = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  if (item === null || item === undefined) return defaultValue; // Handle null/undefined
  try {
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return defaultValue; // Return default if parsing fails
  }
};

const initialState = {
  isAuthenticated: loadFromLocalStorage("isAuthenticated", false) === "true", // Convert to boolean
  user: loadFromLocalStorage("user", null), // Safely parse user data
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, logout, setError } = authSlice.actions;
export default authSlice.reducer;
