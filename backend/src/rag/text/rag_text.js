import { embedText } from "../utils/embeddings.js";

export async function ragText(db, question, estrategia = null, limit = 5) {
  const col = db.collection("chunks");

  const vector = await embedText(question);

  // Filtro opcional por estrategia
  const filter = estrategia ? { estrategia_chunking: { $eq: estrategia } } : {};

  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index_chunks",
        path: "embedding",
        queryVector: vector,
        numCandidates: 150,
        limit,
        filter
      }
    },
    {
      $project: {
        chunk_texto: 1,
        estrategia_chunking: 1,
        doc_id: 1,
        num_tokens: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ];

  const results = await col.aggregate(pipeline).toArray();
  const context = results.map(r => r.chunk_texto).join("\n\n");

  return { results, context };
}