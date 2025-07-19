import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const loadAuthData = () => {
  const token = localStorage.getItem("token")
  const userString = localStorage.getItem("user")

  let user = null
  let isAuthenticated = false

  if(token && userString){
   try {
     const decodedToken = jwtDecode(token)

    if(decodedToken.exp * 1000 > Date.now()){
      isAuthenticated = true
      user = JSON.parse(userString)

      user.role = user.role === "admin" ? "admin" : user.role
    } else {
      console.log("Token expired during load")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
   } catch (error) {
      console.error("Error decoding or parsing token/user from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
   }
  }

  return {isAuthenticated, user, token}
}

const {isAuthenticated, user, token} = loadAuthData()

const initialState = {
  isAuthenticated: isAuthenticated,
  user: user,
  error: null,
  isAuthChecked: false
}


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
        role: payloadUser.role === "admin" ? "admin" : payloadUser.role, 
      };
      console.log("Normalized user:", normalizedUser);

      state.isAuthenticated = true;
      state.user = normalizedUser;
      state.token = token;
      state.error = null;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    setAuthChecked: (state) => {
      state.isAuthChecked = true;
    },
  },
});

export const { loginSuccess, logout, setError, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
