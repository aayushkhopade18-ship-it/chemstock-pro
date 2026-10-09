import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/pubchem": {
        target: "https://pubchem.ncbi.nlm.nih.gov",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/pubchem/, ""),
      },
    },
  },
});