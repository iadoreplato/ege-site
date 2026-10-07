import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  // GitHub Pages: https://iadoreplato.github.io/ege-site/ ; Netlify и локально — "./"
  base: process.env.GITHUB_ACTIONS ? "/ege-site/" : "./",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
