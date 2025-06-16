// src/redux/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const loadThemeFromLocalStorage = () => {
  const savedTheme = localStorage.getItem("darkMode");
  return savedTheme ? JSON.parse(savedTheme) : false; // Default to false (light mode) if not set
};

const initialState = {
  darkMode: loadThemeFromLocalStorage(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode)); // Save to localStorage
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
