import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#1ABC9C", // Turquoise
      },
      secondary: {
        main: "#3498DB", // Peter River
      },
      error: {
        main: "#E74C3C", // Alizarin
      },
      background: {
        default: mode === "light" ? "#ECF0F1" : "#2C3E50", // Clouds / Midnight Blue
        paper: mode === "light" ? "#FFFFFF" : "#2C3E50", // White / Midnight Blue
      },
      text: {
        primary: mode === "light" ? "#2C3E50" : "#ECF0F1", // Midnight Blue / Clouds
        secondary: mode === "light" ? "#7F8C8D" : "#BDC3C7", // Asbestos / Silver
      },
    },
    typography: {
      fontFamily: "Work Sans, sans-serif", // Using Work Sans from Google Fonts
      h1: { fontWeight: 700 }, // Bold for headings
      h4: { fontWeight: 600 }, // Semibold for subheadings
      body1: { fontWeight: 400 }, // Regular for body text
      button: { fontWeight: 500 }, // Medium for buttons
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
    },
  });

export default getTheme;
