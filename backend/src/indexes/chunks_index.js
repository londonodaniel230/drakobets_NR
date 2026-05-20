export default async function chunksIndex(db) {
  const existing = await db.listCollections({ name: "chunks" }).toArray();
  if (existing.length === 0) {
    await db.createCollection("chunks", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["doc_id", "chunk_index", "estrategia_chunking", "chunk_texto", "embedding", "modelo"],
          properties: {
            estrategia_chunking: {
              bsonType: "string",
              enum: ["fixed-size", "sentence-aware", "semantic"]
            },
            embedding: {
              bsonType: "array",
              minItems: 384,
              maxItems: 384
            },
            chunk_index: { bsonType: "int", minimum: 0 }
          }
        }
      },
      validationAction: "error"
    });
    console.log("✔ Creada colección 'chunks' con validator");
  }
  const col = db.collection("chunks");
  await col.createIndex({ doc_id: 1 });
  await col.createIndex({ estrategia_chunking: 1 });
  console.log("✔ Índices base para 'chunks' creados");
}