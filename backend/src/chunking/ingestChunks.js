import { fixedSizeChunk, sentenceAwareChunk, semanticChunk } from "./chunker.js";
import { embedText } from "../rag/utils/embeddings.js";

export async function ingestDocument(db, doc, options = {}) {
  const { strategy = "fixed-size", model = "all-MiniLM-L6-v2" } = options;
  const text = doc.descripcion_texto || doc.content || "";
  let chunks = [];

  if (strategy === "fixed-size") {
    chunks = fixedSizeChunk(text, options.chunkSize || 256, options.overlap || 32);
  } else if (strategy === "sentence-aware") {
    chunks = sentenceAwareChunk(text, options.maxSentences || 5, options.overlap || 1);
  } else if (strategy === "semantic") {
    chunks = await semanticChunk(text, options.similarityThreshold || 0.8);
  } else {
    throw new Error("Estrategia desconocida");
  }

  const col = db.collection("chunks");
  const fecha = new Date();
  const ops = [];

  for (const c of chunks) {
    const emb = await embedText(c.chunk_texto);
    const docChunk = {
      doc_id: doc._id || null,
      chunk_index: c.chunk_index,
      estrategia_chunking: strategy,
      chunk_texto: c.chunk_texto,
      embedding: emb,
      num_tokens: (c.chunk_texto.split(/\s+/).length),
      modelo: model,
      fecha_ingesta: fecha
    };
    ops.push(docChunk);
  }

  if (ops.length) {
    await col.insertMany(ops);
  }

  return { inserted: ops.length };
}
