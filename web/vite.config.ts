import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5400,
    host: true,
    proxy: { "/api": { target: "http://localhost:4300", changeOrigin: true } },
  },
});
