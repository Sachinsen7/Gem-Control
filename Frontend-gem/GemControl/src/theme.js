import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#D4A017", // Rich warm gold
      },
      secondary: {
        main: "#E8B923", // Lighter gold
      },
      error: {
        main: "#A84300", // Burnt orange
      },
      background: {
        default: mode === "light" ? "#FDF6E3" : "#3A2F1A", // Light golden beige / Dark golden brown
        paper: mode === "light" ? "#FFF8E1" : "#3A2F1A", // Pale gold / Dark golden brown
      },
      text: {
        primary: mode === "light" ? "#3A2F1A" : "#F5E8C7", // Dark golden brown / Light beige-gold
        secondary: mode === "light" ? "#6B4E31" : "#D4B996", // Medium golden brown / Light golden brown
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
