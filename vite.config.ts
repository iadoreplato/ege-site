/* НАСТРОЙКИ СБОРЩИКА VITE: как собирать сайт из src/ в папку dist/ (`npm run build`)
   и как запускать его локально (`npm run dev`). */
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  // base — с какого адреса начинается сайт.
  // GitHub Pages: https://iadoreplato.github.io/ege-site/ ; Netlify и локально — "./"
  // (GITHUB_ACTIONS есть только при сборке на GitHub, см. .github/workflows/deploy.yml)
  base: process.env.GITHUB_ACTIONS ? "/ege-site/" : "./",
  // плагины: react — поддержка React и JSX; tailwindcss — для папки components/ui (сейчас не используется)
  plugins: [react(), tailwindcss()],
  // "@" в импортах означает папку src: "@/lib/utils" = "src/lib/utils"
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // node_modules — ссылка на папку node_modules.nosync, и из-за этого Vite при `npm run dev` иногда «не узнаёт»
  // react-dom/client и отдаёт его браузеру неподготовленным → ошибка «Importing binding name 'default'…».
  // Здесь мы явно просим Vite подготовить этот пакет заранее.
  optimizeDeps: { include: ["react-dom/client"] },
});
