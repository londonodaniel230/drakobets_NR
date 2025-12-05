import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import ragRoutes from "./routes/rag.routes.js";

const app = express();

// Necesario para poder leer JSON del frontend
app.use(express.json());

// Resolver rutas de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Servir el frontend automáticamente desde /frontend
app.use(express.static(path.join(process.cwd(), "../frontend")));

// 📌 API RAG
app.use("/api", ragRoutes);

// Si no existe una ruta API, devolver index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "../frontend/index.html"));
});

export default app;
