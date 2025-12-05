import { pipeline } from "@xenova/transformers";
import Groq from "groq-sdk";
import { getDB } from "../config/db.js";

// -----------------------------
// 1) Inicializar pipeline de embeddings (Xenova)
// -----------------------------
console.log("🔄 Cargando modelo de embeddings (Xenova)...");
let embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
console.log("✅ Modelo de embeddings cargado");

// -----------------------------
// 2) Inicializar cliente Groq
// -----------------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// -----------------------------
// 3) Función: generar embedding
// -----------------------------
async function generarEmbedding(texto) {
  try {
    const output = await embedder(texto, { pooling: "mean", normalize: true });
    return Array.from(output.data);  // vector 384 dimensiones
  } catch (error) {
    console.error("❌ Error generando embedding:", error);
    return null;
  }
}

// -----------------------------
// 4) Función: búsqueda vectorial
// -----------------------------
async function buscarSimilaridades(queryVector) {
  const db = getDB();

  return await db.collection("rag_chunks").aggregate([
    {
      $vectorSearch: {
        index: "vector_text",
        path: "embedding",
        queryVector,
        numCandidates: 200,
        limit: 5
      }
    },
    {
      $project: {
        _id: 0,
        texto: 1,
        metadata: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]).toArray();
}

// -----------------------------
// 5) CONTROLADOR RAG COMPLETO
// -----------------------------
export async function handleRag(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Debes enviar un campo 'query'." });
    }

    // 1) Generar embedding
    const embedding = await generarEmbedding(query);
    if (!embedding) {
      return res.status(500).json({ error: "No se pudo generar embedding." });
    }

    // 2) Buscar similitudes
    const resultados = await buscarSimilaridades(embedding);

    // 3) Construir contexto
    let contexto = "";
    resultados.forEach(r => {
      contexto += `• ${r.texto}\n`;
    });

    if (!contexto.trim()) {
      contexto = "No hay datos relevantes en la base.";
    }

    // 4) Llamada al modelo de Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto que responde basado SOLO en el contexto."
        },
        {
          role: "user",
          content: `Pregunta: ${query}\n\nContexto:\n${contexto}\n\nRespuesta basada en el contexto:`
        }
      ]
    });

    res.json({
      ok: true,
      respuesta: completion.choices[0].message.content,
      referencias: resultados
    });

  } catch (error) {
    console.error("❌ Error en RAG:", error);
    res.status(500).json({ error: "Error procesando RAG." });
  }
}
