// backend/scripts/run_seed.js
import { connectDB } from '../src/db.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const seedDatabase = require('../src/seed/seed_runner.cjs');

async function main() {
  const db = await connectDB();

  console.log('\n═══════════════════════════════════');
  console.log('  Ejecutando seed de DrakoBets...');
  console.log('═══════════════════════════════════\n');

  const result = await seedDatabase(db);

  console.log('\n╔══════════════════════════════════╗');
  console.log('  RESUMEN DEL SEED');
  console.log('╠══════════════════════════════════╣');
  Object.keys(result).forEach(k => {
    const val = result[k];
    const count = Array.isArray(val) ? val.length : '?';
    console.log(`  ✔ ${k.padEnd(20)}: ${count} registros`);
  });
  console.log('╚══════════════════════════════════╝\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});