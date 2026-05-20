import express from "express";
import { handleRag, handleSearch } from "../controllers/rag_controller.js";

const router = express.Router();

// POST /api/rag — Genera respuesta con LLM usando contexto de MongoDB
router.post("/rag", handleRag);

// POST /api/search — Búsqueda vectorial sin generación
router.post("/search", handleSearch);

export default router;