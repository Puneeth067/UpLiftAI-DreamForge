import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // good for dev previews
    port: 5173,
  },
  // Important for history fallback in production
  build: {
    outDir: "dist",
  },
});
