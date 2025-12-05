import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("✔ MongoDB conectado correctamente");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

export const getDB = () => {
  return client.db(process.env.DB_NAME || "drakobets");
};
