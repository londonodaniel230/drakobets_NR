import express from "express";
import { handleRag } from "../controllers/rag_controller.js";

const router = express.Router();

// Ruta principal del sistema RAG
router.post("/rag", handleRag);

export default router;
