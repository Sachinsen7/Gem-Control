import { createSlice } from "@reduxjs/toolkit";

const loadFromLocalStorage = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  if (item === null || item === "undefined") return defaultValue;
  try {
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return defaultValue;
  }
};

const initialState = {
  isAuthenticated: loadFromLocalStorage("isAuthenticated", false) === true,
  user: loadFromLocalStorage("user", null),
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      console.log("loginSuccess payload:", action.payload);
      if (!action.payload || !action.payload.user) {
        console.error("Invalid payload for loginSuccess:", action.payload);
        state.error = "Invalid user data received";
        return;
      }

      const { user: payloadUser, token } = action.payload;
      const normalizedUser = {
        ...payloadUser,
        role: payloadUser.role === "admin" ? "admin" : payloadUser.role, // Only default to "user" if undefined
      };
      console.log("Normalized user:", normalizedUser);

      state.isAuthenticated = true;
      state.user = normalizedUser;
      state.error = null;
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
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
