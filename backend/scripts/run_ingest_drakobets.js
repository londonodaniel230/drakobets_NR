// backend/scripts/run_ingest_drakobets.js
// Carga los datasets de juegos y eventos deportivos a MongoDB
// con las tres estrategias de chunking y embeddings

import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from '../src/db.js';
import { ingestDocument } from '../src/chunking/ingestChunks.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Rutas a los datasets ──────────────────────────────────────────────────────
const DATA_DIR = join(__dirname, '../data');
const JUEGOS_FILE = join(DATA_DIR, 'juegos.json');
const EVENTOS_FILE = join(DATA_DIR, 'eventos_deportivos.json');

// ── Estrategias a aplicar ─────────────────────────────────────────────────────
const ESTRATEGIAS = [
  { strategy: 'fixed-size',    chunkSize: 256, overlap: 32 },
  { strategy: 'sentence-aware', maxSentences: 5, overlap: 1 },
  { strategy: 'semantic',      similarityThreshold: 0.8 },
];

// ── Helper: insertar documento en colección ───────────────────────────────────
async function insertarDocumento(db, coleccion, doc) {
  const col = db.collection(coleccion);
  const result = await col.insertOne(doc);
  return result.insertedId;
}

// ── Ingestar juegos ───────────────────────────────────────────────────────────
async function ingestarJuegos(db) {
  console.log('\n═══════════════════════════════════════');
  console.log('  Ingesta de JUEGOS DE CASINO');
  console.log('═══════════════════════════════════════');

  const juegos = JSON.parse(readFileSync(JUEGOS_FILE, 'utf8'));
  let totalChunks = 0;

  for (const juego of juegos) {
    // 1. Insertar documento en colección juegos
    const docMongo = {
      nombre: juego.nombre,
      categoria: juego.categoria,
      idioma: juego.idioma,
      fecha_publicacion: new Date(juego.fecha_publicacion),
      rtp: juego.rtp,
      volatilidad: juego.volatilidad,
      proveedor: juego.proveedor,
      descripcion_texto: juego.descripcion_texto,
      tipo_juego: juego.tipo_juego,
      metadatos: juego.metadatos,
      imagen_id: null,
    };

    const docId = await insertarDocumento(db, 'juegos', docMongo);
    console.log(`\n✔ Insertado juego: ${juego.nombre} (${docId})`);

    // 2. Chunkear con las 3 estrategias
    for (const opts of ESTRATEGIAS) {
      try {
        const resultado = await ingestDocument(
        db,
        { _id: docId, descripcion_texto: String(juego.descripcion_texto) },
        opts
        );
        console.log(`  [${opts.strategy}] → ${resultado.inserted} chunk(s)`);
        totalChunks += resultado.inserted;
      } catch (err) {
        console.error(`  [${opts.strategy}] Error: ${err.message}`);
      }
    }
  }

  console.log(`\n✔ Total juegos: ${juegos.length}`);
  console.log(`✔ Total chunks de juegos: ${totalChunks}`);
  return { documentos: juegos.length, chunks: totalChunks };
}

// ── Ingestar eventos deportivos ───────────────────────────────────────────────
async function ingestarEventos(db) {
  console.log('\n═══════════════════════════════════════');
  console.log('  Ingesta de EVENTOS DEPORTIVOS');
  console.log('═══════════════════════════════════════');

  const eventos = JSON.parse(readFileSync(EVENTOS_FILE, 'utf8'));
  let totalChunks = 0;

  for (const evento of eventos) {
    // 1. Insertar documento en colección eventos_deportivos
    const docMongo = {
      fecha: new Date(evento.fecha),
      ciudad: evento.ciudad,
      pais: evento.pais,
      descripcion_texto: evento.descripcion_texto,
      competencia: evento.competencia,
      participantes: evento.participantes,
      cuotas: evento.cuotas,
      imagen_id: null,
    };

    const docId = await insertarDocumento(db, 'eventos_deportivos', docMongo);
    const etiqueta = `${evento.participantes[0]?.nombre} vs ${evento.participantes[1]?.nombre}`;
    console.log(`\n✔ Insertado evento: ${etiqueta} (${docId})`);

    // 2. Chunkear con las 3 estrategias
    for (const opts of ESTRATEGIAS) {
      try {
       const resultado = await ingestDocument(
        db,
        { _id: docId, descripcion_texto: String(evento.descripcion_texto) },
        opts
        );
        console.log(`  [${opts.strategy}] → ${resultado.inserted} chunk(s)`);
        totalChunks += resultado.inserted;
      } catch (err) {
        console.error(`  [${opts.strategy}] Error: ${err.message}`);
      }
    }
  }

  console.log(`\n✔ Total eventos: ${eventos.length}`);
  console.log(`✔ Total chunks de eventos: ${totalChunks}`);
  return { documentos: eventos.length, chunks: totalChunks };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const db = await connectDB();

  // Limpiar chunks previos de prueba (el documento de sample)
  await db.collection('chunks').deleteMany({});
  console.log('✔ Colección chunks limpiada');

  const resJuegos  = await ingestarJuegos(db);
  const resEventos = await ingestarEventos(db);

  console.log('\n╔═══════════════════════════════════════╗');
  console.log('  RESUMEN FINAL');
  console.log('╠═══════════════════════════════════════╣');
  console.log(`  Juegos insertados:          ${resJuegos.documentos}`);
  console.log(`  Eventos insertados:         ${resEventos.documentos}`);
  console.log(`  Total documentos:           ${resJuegos.documentos + resEventos.documentos}`);
  console.log(`  Chunks juegos:              ${resJuegos.chunks}`);
  console.log(`  Chunks eventos:             ${resEventos.chunks}`);
  console.log(`  Total chunks:               ${resJuegos.chunks + resEventos.chunks}`);
  console.log('╚═══════════════════════════════════════╝');

  process.exit(0);
}

main().catch(err => {
  console.error('Error en ingesta:', err);
  process.exit(1);
});