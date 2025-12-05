import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Necesario para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir frontend desde /frontend (NO /public)
app.use(express.static(path.join(process.cwd(), "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "../frontend/index.html"));
});

async function startServer() {
  try {
    await connectDB(); // 🔥 No iniciar server hasta que Mongo esté listo

    app.listen(3000, () => {
      console.log("🚀 Servidor activo en http://localhost:3000");
    });

  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
}

startServer();
