// backend/scripts/run_ingest_imagenes.js
// Genera embeddings CLIP desde descripciones de texto (512 dims)
// Compatible con búsqueda multimodal texto↔imagen
// Requiere servidor de embeddings corriendo en puerto 5005

import 'dotenv/config';
import { connectDB } from '../src/db.js';
import axios from 'axios';

const EMBEDDINGS_API = process.env.EMBEDDINGS_API || 'http://localhost:5005/embed';

async function embedTextCLIP(text) {
  const res = await axios.post(`${EMBEDDINGS_API}/text-clip`, { text });
  return res.data.embedding;
}

const IMAGENES = [
  // ── Escudos de fútbol ─────────────────────────────────────────────────────
  { tipo: "escudo", entidad: "Real Madrid",          descripcion_alt: "Escudo del Real Madrid, club de futbol espanol, circulo blanco con corona real y letras MCF en azul",           url: "https://media.api-sports.io/football/teams/541.png" },
  { tipo: "escudo", entidad: "FC Barcelona",          descripcion_alt: "Escudo del FC Barcelona, club catalan, colores azul y grana con cruz de San Jorge y balon de futbol",           url: "https://media.api-sports.io/football/teams/529.png" },
  { tipo: "escudo", entidad: "Manchester City",       descripcion_alt: "Escudo del Manchester City, club ingles, aguila dorada con barco y estrellas en fondo azul celeste",            url: "https://media.api-sports.io/football/teams/50.png"  },
  { tipo: "escudo", entidad: "Arsenal FC",            descripcion_alt: "Escudo del Arsenal FC, club de Londres, canon dorado sobre fondo rojo con el nombre Arsenal",                  url: "https://media.api-sports.io/football/teams/42.png"  },
  { tipo: "escudo", entidad: "Bayern Munich",         descripcion_alt: "Escudo del Bayern Munich, club aleman, rombos azules y blancos en circulo rojo con letras FCB",               url: "https://media.api-sports.io/football/teams/157.png" },
  { tipo: "escudo", entidad: "Borussia Dortmund",     descripcion_alt: "Escudo del Borussia Dortmund, club aleman, circulo negro con letras BVB en amarillo dorado",                  url: "https://media.api-sports.io/football/teams/165.png" },
  { tipo: "escudo", entidad: "Paris Saint-Germain",   descripcion_alt: "Escudo del PSG Paris Saint-Germain, club frances, torre Eiffel con flor de lis en azul marino y rojo",       url: "https://media.api-sports.io/football/teams/85.png"  },
  { tipo: "escudo", entidad: "AC Milan",              descripcion_alt: "Escudo del AC Milan, club italiano, escudo bipartido en rojo y negro con iniciales ACM y corona",              url: "https://media.api-sports.io/football/teams/489.png" },
  { tipo: "escudo", entidad: "Inter de Milan",        descripcion_alt: "Escudo del Inter de Milan, club italiano, circulo azul y negro con letras FCIM entrelazadas",                 url: "https://media.api-sports.io/football/teams/505.png" },
  { tipo: "escudo", entidad: "Atletico de Madrid",    descripcion_alt: "Escudo del Atletico de Madrid, club espanol, oso y madrano en escudo rojo y blanco con rayas verticales",     url: "https://media.api-sports.io/football/teams/530.png" },
  { tipo: "escudo", entidad: "Manchester United",     descripcion_alt: "Escudo del Manchester United, club ingles, diablo rojo con tridente en escudo rojo con barco y estrella",     url: "https://media.api-sports.io/football/teams/33.png"  },
  { tipo: "escudo", entidad: "Juventus",              descripcion_alt: "Escudo de la Juventus, club italiano, escudo blanco y negro en forma de J estilizada moderna minimalista",    url: "https://media.api-sports.io/football/teams/496.png" },
  { tipo: "escudo", entidad: "Chelsea FC",            descripcion_alt: "Escudo del Chelsea FC, club de Londres, leon azul con baston en escudo azul royal con nombre Chelsea",        url: "https://media.api-sports.io/football/teams/49.png"  },
  { tipo: "escudo", entidad: "Liverpool FC",          descripcion_alt: "Escudo del Liverpool FC, club ingles, pajaro Liver en escudo rojo con llamas y bandera de Merseyside",        url: "https://media.api-sports.io/football/teams/40.png"  },
  { tipo: "escudo", entidad: "Boca Juniors",          descripcion_alt: "Escudo de Boca Juniors, club argentino, circulo azul y amarillo dorado con letras CABJ entrelazadas",         url: "https://media.api-sports.io/football/teams/405.png" },
  { tipo: "escudo", entidad: "River Plate",           descripcion_alt: "Escudo de River Plate, club argentino, banda roja diagonal sobre fondo blanco con iniciales CARP",            url: "https://media.api-sports.io/football/teams/406.png" },
  { tipo: "escudo", entidad: "Flamengo",              descripcion_alt: "Escudo del Flamengo, club brasileno, escudo rojo y negro con letras CRF y aguila en parte superior",          url: "https://media.api-sports.io/football/teams/127.png" },
  { tipo: "escudo", entidad: "Santos FC",             descripcion_alt: "Escudo del Santos FC, club brasileno, pez negro sobre fondo blanco con nombre Santos en letras negras",       url: "https://media.api-sports.io/football/teams/121.png" },
  { tipo: "escudo", entidad: "America Mexico",        descripcion_alt: "Escudo del Club America, club mexicano, aguila dorada sobre circulo azul marino con nombre America",          url: "https://media.api-sports.io/football/teams/2283.png"},
  { tipo: "escudo", entidad: "Guadalajara Chivas",    descripcion_alt: "Escudo de las Chivas Guadalajara, club mexicano, cabra con rayas rojas y blancas verticales en escudo",      url: "https://media.api-sports.io/football/teams/2282.png"},
  { tipo: "escudo", entidad: "Tottenham Hotspur",     descripcion_alt: "Escudo del Tottenham Hotspur, club ingles, gallo dorado sobre pelota en escudo azul marino",                 url: "https://media.api-sports.io/football/teams/47.png"  },
  { tipo: "escudo", entidad: "Leicester City",        descripcion_alt: "Escudo del Leicester City, club ingles, zorro azul sobre fondo blanco con nombre Leicester City",            url: "https://media.api-sports.io/football/teams/46.png"  },
  { tipo: "escudo", entidad: "Roma",                  descripcion_alt: "Escudo de la AS Roma, club italiano, loba romana amamantando a Romulo y Remo en escudo amarillo y rojo",      url: "https://media.api-sports.io/football/teams/497.png" },
  { tipo: "escudo", entidad: "Napoli",                descripcion_alt: "Escudo del SSC Napoli, club italiano, letra N estilizada en azul sobre fondo blanco circular",               url: "https://media.api-sports.io/football/teams/492.png" },
  { tipo: "escudo", entidad: "Sevilla FC",            descripcion_alt: "Escudo del Sevilla FC, club espanol, San Fernando con manto real en escudo blanco y rojo",                   url: "https://media.api-sports.io/football/teams/536.png" },
  { tipo: "escudo", entidad: "Valencia CF",           descripcion_alt: "Escudo del Valencia CF, club espanol, murcielago negro sobre fondo blanco y naranja con corona real",        url: "https://media.api-sports.io/football/teams/532.png" },
  { tipo: "escudo", entidad: "Porto",                 descripcion_alt: "Escudo del FC Porto, club portugues, dragon azul y blanco en escudo con franja azul y blanca",               url: "https://media.api-sports.io/football/teams/212.png" },
  { tipo: "escudo", entidad: "Benfica",               descripcion_alt: "Escudo del SL Benfica, club portugues, aguila roja sobre escudo rojo con estrella y letras SLB",             url: "https://media.api-sports.io/football/teams/211.png" },
  { tipo: "escudo", entidad: "Ajax",                  descripcion_alt: "Escudo del Ajax Amsterdam, club holandes, rostro de Ajax guerrero griego en rojo sobre fondo blanco",        url: "https://media.api-sports.io/football/teams/194.png" },
  { tipo: "escudo", entidad: "Galatasaray",           descripcion_alt: "Escudo del Galatasaray, club turco, luna creciente y estrella amarilla sobre fondo rojo circular",           url: "https://media.api-sports.io/football/teams/357.png" },

  // ── Logos de baloncesto NBA ───────────────────────────────────────────────
  { tipo: "logo", entidad: "Miami Heat",            descripcion_alt: "Logo del Miami Heat NBA, balon de baloncesto en llamas rojas y naranjas sobre fondo negro",                   url: "https://media.api-sports.io/basketball/teams/18.png" },
  { tipo: "logo", entidad: "Boston Celtics",        descripcion_alt: "Logo de los Boston Celtics NBA, leprechaun verde con sombrero apoyado en baston sobre fondo verde",          url: "https://media.api-sports.io/basketball/teams/2.png"  },
  { tipo: "logo", entidad: "Los Angeles Lakers",    descripcion_alt: "Logo de los Los Angeles Lakers NBA, letras Lakers en purpura y dorado sobre fondo morado",                   url: "https://media.api-sports.io/basketball/teams/13.png" },
  { tipo: "logo", entidad: "Chicago Bulls",         descripcion_alt: "Logo de los Chicago Bulls NBA, toro rojo embistiendo sobre fondo blanco y negro",                            url: "https://media.api-sports.io/basketball/teams/7.png"  },
  { tipo: "logo", entidad: "Golden State Warriors", descripcion_alt: "Logo de los Golden State Warriors NBA, puente Golden Gate en azul y dorado con nombre Warriors",             url: "https://media.api-sports.io/basketball/teams/11.png" },
  { tipo: "logo", entidad: "Brooklyn Nets",         descripcion_alt: "Logo de los Brooklyn Nets NBA, red de baloncesto en blanco y negro minimalista moderno",                     url: "https://media.api-sports.io/basketball/teams/5.png"  },
  { tipo: "logo", entidad: "Phoenix Suns",          descripcion_alt: "Logo de los Phoenix Suns NBA, sol naranja radiante con llamaradas sobre fondo morado",                       url: "https://media.api-sports.io/basketball/teams/26.png" },
  { tipo: "logo", entidad: "Dallas Mavericks",      descripcion_alt: "Logo de los Dallas Mavericks NBA, caballo mustang azul y plateado en movimiento sobre fondo azul",           url: "https://media.api-sports.io/basketball/teams/9.png"  },
  { tipo: "logo", entidad: "Milwaukee Bucks",       descripcion_alt: "Logo de los Milwaukee Bucks NBA, ciervo verde con astas sobre fondo blanco y verde oscuro",                  url: "https://media.api-sports.io/basketball/teams/20.png" },
  { tipo: "logo", entidad: "Denver Nuggets",        descripcion_alt: "Logo de los Denver Nuggets NBA, pepita de oro con montanas en azul marino y amarillo dorado",                url: "https://media.api-sports.io/basketball/teams/10.png" },

  // ── Logos de futbol americano NFL ─────────────────────────────────────────
  { tipo: "logo", entidad: "Kansas City Chiefs",    descripcion_alt: "Logo de los Kansas City Chiefs NFL, cabeza de guerrero nativo americano en rojo y dorado",                   url: "https://media.api-sports.io/american-football/teams/6.png"  },
  { tipo: "logo", entidad: "San Francisco 49ers",   descripcion_alt: "Logo de los San Francisco 49ers NFL, casco rojo con doble barra dorada y roja 49ers",                        url: "https://media.api-sports.io/american-football/teams/23.png" },
  { tipo: "logo", entidad: "New England Patriots",  descripcion_alt: "Logo de los New England Patriots NFL, patriota colonial azul con tricornio y uniforme rojo",                url: "https://media.api-sports.io/american-football/teams/14.png" },
  { tipo: "logo", entidad: "Green Bay Packers",     descripcion_alt: "Logo de los Green Bay Packers NFL, letra G verde y dorada sobre fondo verde oscuro oval",                    url: "https://media.api-sports.io/american-football/teams/9.png"  },
  { tipo: "logo", entidad: "Tampa Bay Buccaneers",  descripcion_alt: "Logo de los Tampa Bay Buccaneers NFL, pirata con espada en rojo plateado y negro",                          url: "https://media.api-sports.io/american-football/teams/27.png" },
];

async function main() {
  const db = await connectDB();
  const col = db.collection('imagenes');

  await col.deleteMany({});
  console.log('Coleccion imagenes limpiada\n');

  let insertadas = 0;
  let errores = 0;

  for (const img of IMAGENES) {
    try {
      process.stdout.write(`  ${img.entidad.padEnd(28)}`);

      // Generar embedding CLIP desde descripcion de texto
      const embedding = await embedTextCLIP(img.descripcion_alt);

      if (!embedding || embedding.length === 0) {
        console.log('ERROR: embedding vacio');
        errores++;
        continue;
      }

      await col.insertOne({
        tipo: img.tipo,
        entidad: img.entidad,
        descripcion_alt: img.descripcion_alt,
        url: img.url,
        embedding_clip: embedding,
        modelo: 'clip-vit-base-patch32-text',
        fecha_ingesta: new Date()
      });

      console.log(`OK ${embedding.length} dims`);
      insertadas++;

    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errores++;
    }
  }

  console.log(`\nInsertadas: ${insertadas}`);
  console.log(`Errores:    ${errores}`);
  console.log(`Total:      ${IMAGENES.length}`);
  process.exit(0);
}

main().catch(err => { console.error(err.message); process.exit(1); });