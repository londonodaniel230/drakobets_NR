import { getDB } from "../config/db.js";
import { ragText } from "../rag/text/rag_text.js";
import { embedImage } from "../rag/utils/embeddings.js";

export async function search(req, res) {
  try {
    const { type, query, imageBase64, estrategia = null, limit = 5 } = req.body;
    const db = getDB();

    // Búsqueda texto → texto (RAG semántico)
    if (type === "t2t") {
      const resultado = await ragText(db, query, estrategia, limit);
      return res.json({ ok: true, ...resultado });
    }

    // Búsqueda texto → imagen (CLIP)
    if (type === "t2i") {
      const vector = await embedImage(query); // texto como query para CLIP
      const results = await db.collection("imagenes").aggregate([
        {
          $vectorSearch: {
            index: "vector_index_imagenes",
            path: "embedding_clip",
            queryVector: vector,
            numCandidates: 50,
            limit
          }
        },
        {
          $project: {
            url: 1,
            descripcion_alt: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ]).toArray();
      return res.json({ ok: true, results });
    }

    // Búsqueda imagen → imagen (CLIP)
    if (type === "i2i") {
      const vector = await embedImage(imageBase64);
      const results = await db.collection("imagenes").aggregate([
        {
          $vectorSearch: {
            index: "vector_index_imagenes",
            path: "embedding_clip",
            queryVector: vector,
            numCandidates: 50,
            limit
          }
        },
        {
          $project: {
            url: 1,
            descripcion_alt: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ]).toArray();
      return res.json({ ok: true, results });
    }

    return res.status(400).json({ error: "Tipo inválido. Usa: t2t, t2i, i2i" });

  } catch (error) {
    console.error("Error en search:", error);
    res.status(500).json({ error: "Error en búsqueda: " + error.message });
  }
}