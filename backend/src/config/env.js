import dotenv from "dotenv";
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI;
export const DB_NAME = process.env.DB_NAME || "drakobets";
export const EMBEDDINGS_API = process.env.EMBEDDINGS_API || "http://localhost:5005/embed";
export const GROQ_API_KEY = process.env.GROQ_API_KEY;
