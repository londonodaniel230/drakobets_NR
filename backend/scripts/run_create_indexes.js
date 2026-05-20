import 'dotenv/config';
import { connectDB } from '../src/db.js';
import createAllIndexes from '../src/indexes/createAllIndexes.js';

async function main() {
  const db = await connectDB();
  try {
    await createAllIndexes(db);
    console.log('✔ createAllIndexes ejecutado correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error creando índices:', err);
    process.exit(1);
  }
}

main();