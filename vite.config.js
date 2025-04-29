import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Add these configurations
  esbuild: {
    loader: 'jsx',
    include: /\.(jsx|js|ts|tsx)$/,
  },
  optimizeDeps: {
    exclude: ['jspdf'], // Exclude problematic package
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  
  // Expose server to network
  server: {
    host: true, // Exposes the server to the local network
    port: 5173, // Optional: specify port (default is 5173)
  },
});