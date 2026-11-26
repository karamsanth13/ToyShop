import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const clientDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: clientDirectory,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.join(clientDirectory, "src") } },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://localhost:3001" },
  },
  build: { outDir: "build", emptyOutDir: true },
});
