import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import ragRoutes from "./routes/rag.routes.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(process.cwd(), "../frontend")));

// Búsqueda multimodal — debe ir ANTES de ragRoutes
app.use("/api/search", searchRoutes);

// RAG y search vectorial
app.use("/api", ragRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "../frontend/index.html"));
});

export default app;