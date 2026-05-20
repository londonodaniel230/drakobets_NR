import Groq from "groq-sdk";
import { getDB } from "../config/db.js";
import { embedText } from "../rag/utils/embeddings.js";

// -----------------------------
// 1) Inicializar cliente Groq
// -----------------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// -----------------------------
// 2) Función: búsqueda vectorial en colección chunks
// -----------------------------
async function buscarChunks(queryVector, estrategia = null, limit = 5) {
  const db = getDB();

  // Filtro opcional por estrategia de chunking
  const filter = estrategia ? { estrategia_chunking: { $eq: estrategia } } : {};

  return await db.collection("chunks").aggregate([
    {
      $vectorSearch: {
        index: "vector_index_chunks",
        path: "embedding",
        queryVector,
        numCandidates: 150,
        limit,
        filter
      }
    },
    {
      $project: {
        _id: 0,
        chunk_texto: 1,
        estrategia_chunking: 1,
        doc_id: 1,
        num_tokens: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]).toArray();
}

// -----------------------------
// 3) CONTROLADOR RAG — POST /api/rag
// -----------------------------
export async function handleRag(req, res) {
  try {
    const { query, estrategia = null } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Debes enviar un campo 'query'." });
    }

    // 1) Generar embedding via servidor Python (puerto 5005)
    const embedding = await embedText(query);
    if (!embedding) {
      return res.status(500).json({ error: "No se pudo generar embedding." });
    }

    // 2) Buscar chunks similares
    const chunks = await buscarChunks(embedding, estrategia);

    if (chunks.length === 0) {
      return res.json({
        ok: true,
        respuesta: "No encontré información relevante en la base de conocimiento.",
        referencias: []
      });
    }

    // 3) Construir contexto con los chunks recuperados
    const contexto = chunks
      .map((c, i) => `[${i + 1}] ${c.chunk_texto}`)
      .join("\n\n");

    // 4) Llamada a Groq — Llama 3.3 70B
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Eres un asistente experto de DrakoBets, una plataforma de casino y apuestas online. 
Responde SOLO basándote en el contexto proporcionado. 
Si la información no está en el contexto, dilo claramente.
Responde siempre en español de forma clara y concisa.`
        },
        {
          role: "user",
          content: `Pregunta: ${query}\n\nContexto recuperado:\n${contexto}\n\nRespuesta:`
        }
      ],
      max_tokens: 1024,
      temperature: 0.3
    });

    // 5) Guardar consulta en MongoDB
    try {
      const db = getDB();
      await db.collection("consultas").insertOne({
        query_texto: query,
        respuesta_llm: completion.choices[0].message.content,
        estrategia_usada: estrategia || "todas",
        chunks_recuperados: chunks.map(c => c.doc_id),
        tiempo_respuesta_ms: null,
        fecha: new Date()
      });
    } catch (e) {
      // No detener la respuesta si falla el log
      console.error("Error guardando consulta:", e.message);
    }

    res.json({
      ok: true,
      respuesta: completion.choices[0].message.content,
      estrategia_usada: estrategia || "todas",
      referencias: chunks
    });

  } catch (error) {
    console.error("Error en RAG:", error);
    res.status(500).json({ error: "Error procesando RAG: " + error.message });
  }
}

// -----------------------------
// 4) CONTROLADOR SEARCH — POST /api/search
// -----------------------------
export async function handleSearch(req, res) {
  try {
    const { query, estrategia = null, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Debes enviar un campo 'query'." });
    }

    const embedding = await embedText(query);
    const resultados = await buscarChunks(embedding, estrategia, limit);

    res.json({
      ok: true,
      total: resultados.length,
      estrategia_usada: estrategia || "todas",
      resultados
    });

  } catch (error) {
    console.error("Error en Search:", error);
    res.status(500).json({ error: "Error en búsqueda: " + error.message });
  }
}