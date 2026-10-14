/* Точка входа: отсюда начинается сайт.
   index.html загружает этот файл, а он подключает стили и «вставляет» приложение App в <div id="root">. */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./tailwind.css"; // стили для папки components/ui (сейчас не используются)
import "./styles.css";   // всё оформление сайта

// StrictMode — режим React для разработки: предупреждает о возможных ошибках в консоли, на работу сайта не влияет
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
