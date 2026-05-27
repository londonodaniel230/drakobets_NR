const usuariosSeed = require("./usuarios_seed.cjs");
const competenciasSeed = require("./competencias_seed.cjs");
const equiposSeed = require("./equipos_seed.cjs");
const jugadoresSeed = require("./jugadores_seed.cjs");
const juegosSeed = require("./juegos_seed.cjs");
const premiosSeed = require("./premios_seed.cjs");
const tipoApuestaSeed = require("./tipoApuesta_seed.cjs");
const eventosSeed = require("./eventos_seed.cjs");
const transaccionesSeed = require("./transacciones_seed.cjs");
const apuestaCasinoSeed = require("./apuestaCasino_seed.cjs");
const apuestasSeed = require("./apuestas_seed.cjs");
const detalleApuestaSeed = require("./detalleApuesta_seed.cjs");
const apuestasCompetenciasSeed = require("./apuestasCompetencias_seed.cjs");

module.exports = async function seedDatabase(db) {
  const usuarios = await usuariosSeed(db);
  const competencias = await competenciasSeed(db);
  const equipos = await equiposSeed(db);
  const jugadores = await jugadoresSeed(db, equipos);
  const juegos = await juegosSeed(db);
  const premios = await premiosSeed(db);
  const tiposApuesta = await tipoApuestaSeed(db);
  const eventos = await eventosSeed(db, competencias);
  const transacciones = await transaccionesSeed(db, usuarios);
  const apuestasCasino = await apuestaCasinoSeed(db, usuarios, juegos);
  const apuestas = await apuestasSeed(db, usuarios, premios);
  const detalles = await detalleApuestaSeed(db, apuestas, eventos, tiposApuesta);
  const apuestasComp = await apuestasCompetenciasSeed(db, apuestas, competencias);

  return {
    usuarios, competencias, equipos, jugadores, juegos, premios,
    tiposApuesta, eventos, transacciones, apuestasCasino,
    apuestas, detalles, apuestasComp
  };
};

