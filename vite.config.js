import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // Se suas rotas no backend já começam com '/api', você pode remover a linha abaixo
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
