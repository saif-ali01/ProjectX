import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: "/", // Serve assets from root for Netlify
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});