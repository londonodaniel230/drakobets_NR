import 'dotenv/config';
import { connectDB } from '../src/db.js';
import { ingestDocument } from '../src/chunking/ingestChunks.js';

async function main() {
  const db = await connectDB();
  const sample = {
    _id: null,
    nombre: 'Documento de prueba',
    descripcion_texto: 'Este es un texto de prueba para verificar el pipeline de chunking. Contiene varias oraciones. Sirve para validar la creación de chunks y embeddings.'
  };

  const res = await ingestDocument(db, sample, { strategy: 'sentence-aware' });
  console.log('Resultado ingestSample:', res);
  process.exit(0);
}

main();
