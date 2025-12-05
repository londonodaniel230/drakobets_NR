import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client = null;
let db = null;

export async function connectDB() {
  try {
    if (db) return db; // 🔥 Si ya está conectada, no volver a conectar

    console.log("🔌 Conectando a MongoDB...");

    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    db = client.db(process.env.DB_NAME);

    console.log("✅ MongoDB conectado correctamente");
    return db;

  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error("❌ La base de datos no está inicializada.");
  }
  return db;
}
