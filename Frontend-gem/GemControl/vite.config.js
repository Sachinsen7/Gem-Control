import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@mui/material": "@mui/material",
      "@mui/icons-material": "@mui/icons-material",
    },
  },
  assetsInclude: ["**/*.woff2", "**/*.woff", "**/*.ttf", "**/*.otf"], // Include font file types
});
