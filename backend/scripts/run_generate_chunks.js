import 'dotenv/config';
import { connectDB } from '../src/db.js';
import { ingestDocument } from '../src/chunking/ingestChunks.js';

async function main() {
  const src = process.argv[2] || 'juegos';
  const strategy = process.argv[3] || 'fixed-size';
  const limit = parseInt(process.argv[4] || '50', 10);

  const db = await connectDB();
  const col = db.collection(src);

  const cursor = col.find({}).limit(limit);
  let count = 0;
  for await (const doc of cursor) {
    try {
      const res = await ingestDocument(db, doc, { strategy });
      console.log(`✔ Procesado doc ${doc._id} -> insertedChunks=${res.inserted}`);
      count++;
    } catch (err) {
      console.error(`❌ Error procesando doc ${doc._id}:`, err.message);
    }
  }

  console.log(`Finalizado. Documentos procesados: ${count}`);
  process.exit(0);
}

main();
