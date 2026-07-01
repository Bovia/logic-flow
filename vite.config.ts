import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api/quote": {
        target: "https://push2.eastmoney.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quote/, "/api/qt/stock/get"),
        headers: {
          Referer: "https://quote.eastmoney.com/",
        },
      },
    },
  },
});
