// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173, 
    proxy: {
      "/api": {
        target: "http://192.168.0.26:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  }
});
