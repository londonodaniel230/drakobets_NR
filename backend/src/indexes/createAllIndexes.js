import usuarioIndex from './usuario_index.js';
import transaccionIndex from './transaccion_index.js';
import apuestaIndex from './apuesta_index.js';
import apuestaCasinoIndex from './apuestaCasino_index.js';
import eventoIndex from './evento_index.js';
import competenciaIndex from './competencia_index.js';
import chunksIndex from './chunks_index.js';

export default async function createAllIndexes(db) {
  await usuarioIndex(db);
  await transaccionIndex(db);
  await apuestaIndex(db);
  await apuestaCasinoIndex(db);
  await eventoIndex(db);
  await competenciaIndex(db);
  await chunksIndex(db);
}