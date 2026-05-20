import { embedText } from "../rag/utils/embeddings.js";

// Fixed-size chunking by words (approx tokens)
export function fixedSizeChunk(text, chunkSize = 256, overlap = 32) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let i = 0;
  let index = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + chunkSize).join(" ");
    chunks.push({ chunk_texto: slice, chunk_index: index++ });
    i += chunkSize - overlap;
  }
  return chunks;
}

// Sentence-aware chunking
export function sentenceAwareChunk(text, maxSentences = 5, overlap = 1) {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks = [];
  let i = 0;
  let idx = 0;
  while (i < sentences.length) {
    const slice = sentences.slice(i, i + maxSentences).join(" ").trim();
    chunks.push({ chunk_texto: slice, chunk_index: idx++ });
    i += maxSentences - overlap;
  }
  return chunks;
}

// Semantic chunking: greedy grouping using embeddings similarity
export async function semanticChunk(text, similarityThreshold = 0.8) {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  // compute embeddings for each sentence (calls external embeddings service)
  const embeddings = [];
  for (const s of sentences) {
    const v = await embedText(s);
    embeddings.push(v);
  }

  // greedy grouping: start a cluster with first sentence, add next if cosine sim > threshold
  function dot(a, b) { return a.reduce((s, v, i) => s + v * b[i], 0); }
  function norm(a) { return Math.sqrt(a.reduce((s, v) => s + v * v, 0)); }
  function cos(a, b) { return dot(a, b) / (norm(a) * norm(b) + 1e-12); }

  const chunks = [];
  let cluster = [];
  let clusterVec = null;
  let idx = 0;
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const v = embeddings[i];
    if (!cluster.length) {
      cluster.push(s);
      clusterVec = v.slice();
    } else {
      const similarity = cos(clusterVec, v);
      if (similarity >= similarityThreshold) {
        cluster.push(s);
        // update clusterVec as centroid
        for (let k = 0; k < clusterVec.length; k++) clusterVec[k] = (clusterVec[k] + v[k]) / 2;
      } else {
        chunks.push({ chunk_texto: cluster.join(" "), chunk_index: idx++ });
        cluster = [s];
        clusterVec = v.slice();
      }
    }
  }
  if (cluster.length) chunks.push({ chunk_texto: cluster.join(" "), chunk_index: idx++ });
  return chunks;
}
