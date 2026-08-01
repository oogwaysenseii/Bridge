import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const DEV_SERVER_PORT = 5173;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: DEV_SERVER_PORT,
  },
});
