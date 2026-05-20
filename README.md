# 🐉 DrakoBets RAG
### Sistema de Consulta Inteligente para Casino Online
> MongoDB Atlas · Node.js · FastAPI · Groq Llama 3.3 · all-MiniLM-L6-v2 · CLIP

---

## 📋 Descripción

DrakoBets RAG es un sistema de Recuperación y Generación Aumentada (RAG) construido sobre la base de datos de la plataforma de apuestas en línea DrakoBets. Permite consultar información sobre juegos de casino, reglas, competencias deportivas, equipos y jugadores mediante búsqueda vectorial semántica, y genera respuestas precisas usando Groq + Llama 3.3 70B.

El sistema implementa y compara **tres estrategias de chunking**: `fixed-size`, `sentence-aware` y `semantic`, almacenando todos los fragmentos en MongoDB Atlas con el campo `estrategia_chunking` para análisis comparativo.

---

## 📁 Estructura del Proyecto

```
drakobets_NR/
│
├── backend/                        ← Servidor Node.js + Express
│   ├── scripts/
│   │   ├── run_create_indexes.js   ← Crea colecciones e índices en MongoDB
│   │   ├── run_ingest_sample.js    ← Prueba el pipeline con un documento de muestra
│   │   └── run_generate_embeddings.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               ← Conexión a MongoDB Atlas
│   │   │   └── env.js              ← Variables de entorno centralizadas
│   │   ├── chunking/
│   │   │   ├── chunker.js          ← Implementación de las 3 estrategias de chunking
│   │   │   └── ingestChunks.js     ← Pipeline de ingesta: chunk → embed → insert
│   │   ├── controllers/
│   │   │   ├── rag_controller.js   ← Lógica del endpoint POST /rag
│   │   │   └── search_controller.js← Lógica del endpoint POST /search
│   │   ├── indexes/
│   │   │   ├── createAllIndexes.js ← Orquestador de índices
│   │   │   ├── chunks_index.js     ← Colección chunks con schema validation
│   │   │   ├── usuario_index.js
│   │   │   ├── apuesta_index.js
│   │   │   ├── apuestaCasino_index.js
│   │   │   ├── competencia_index.js
│   │   │   ├── evento_index.js
│   │   │   └── transaccion_index.js
│   │   ├── rag/
│   │   │   ├── llm/
│   │   │   │   └── groq.js         ← Integración con Groq API
│   │   │   ├── text/               ← Pipeline RAG para texto
│   │   │   ├── hybrid/             ← Búsqueda híbrida vectorial + filtros
│   │   │   └── utils/
│   │   │       └── embeddings.js   ← Cliente HTTP al servidor de embeddings
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js               ← Servidor Express en puerto 3000
│   ├── .env                        ← ⚠️ NO subir a Git
│   └── package.json
│
├── embeddings/                     ← Servidor Python de embeddings
│   ├── servicio_embeddings.py      ← FastAPI en puerto 5005 (CLIP + MiniLM)
│   ├── text/
│   │   └── generar_embeddings_texto.py
│   └── image/
│       └── generar_embeddings_imagenes.py
│
├── frontend/                       ← Interfaz web servida por Express
│   └── index.html
│
├── docs_extracted/                 ← Documentación del proyecto
├── requirements.txt                ← Dependencias Python
├── .gitignore
└── README.md
```

---

## ⚙️ Requisitos Previos

| Herramienta | Versión | Propósito |
|---|---|---|
| Node.js | 18+ | Backend Express + scripts |
| Python | 3.10 – 3.11 | Servidor de embeddings |
| MongoDB Atlas | M0 (gratuito) | Base de datos + Vector Search |
| Cuenta Groq | API Key activa | LLM generativo (Llama 3.3 70B) |

---

## 🔐 Configuración de Variables de Entorno

Crea el archivo `backend/.env` con el siguiente contenido:

```env
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=Proyecto
GROQ_API_KEY=tu_api_key_de_groq
EMBEDDINGS_API=http://localhost:5005/embed
```

> ⚠️ El `.env` debe estar en `/backend`, no en `/src`. Nunca lo subas a Git.

Para obtener el `MONGO_URI`:
1. Entra a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click en **Connect** → **Drivers** → Node.js 6.x
3. Copia la cadena y reemplaza `<usuario>` y `<password>`

Para obtener la `GROQ_API_KEY`:
1. Entra a [console.groq.com](https://console.groq.com)
2. API Keys → Create API Key

---

## 🚀 Instalación y Puesta en Marcha

### Paso 1 — Instalar dependencias Node.js

```bash
cd backend
npm install
```

### Paso 2 — Crear colecciones e índices en MongoDB

```bash
cd backend
node scripts/run_create_indexes.js
```

Salida esperada:
```
✔ MongoDB conectado correctamente
✔ Creada colección 'chunks' con validator
✔ Índices base para 'chunks' creados
✔ createAllIndexes ejecutado correctamente
```

### Paso 3 — Crear el índice vectorial en Atlas UI

> Este índice **no se puede crear por script** — debe hacerse desde la interfaz de Atlas.

1. En Atlas, ve a **Atlas Search** → **Create Search Index**
2. Selecciona **Atlas Vector Search**
3. Base de datos: `Proyecto` | Colección: `chunks`
4. Nombre: `vector_index_chunks`
5. Pega este JSON:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "estrategia_chunking"
    },
    {
      "type": "filter",
      "path": "doc_id"
    }
  ]
}
```

6. Haz click en **Create** y espera a que el estado pase de `PENDING` a `Active`.

### Paso 4 — Instalar dependencias Python

```bash
cd embeddings
python -m pip install uvicorn fastapi transformers torch sentence-transformers pillow
```

### Paso 5 — Levantar el servidor de embeddings

> ⚠️ Este servidor debe estar corriendo **siempre** que uses el sistema.

Abre una terminal dedicada y ejecuta:

```bash
cd embeddings
python -m uvicorn servicio_embeddings:app --port 5005 --reload
```

Salida esperada:
```
INFO: Uvicorn running on http://127.0.0.1:5005
INFO: Application startup complete.
```

Puedes verificar que funciona en: [http://127.0.0.1:5005/docs](http://127.0.0.1:5005/docs)

### Paso 6 — Verificar el pipeline con documento de muestra

Sin cerrar la terminal del paso anterior, en otra terminal:

```bash
cd backend
node scripts/run_ingest_sample.js
```

Salida esperada:
```
✔ MongoDB conectado correctamente
Resultado ingestSample: { inserted: 1 }
```

Verifica en Atlas → `Proyecto` → `chunks` que aparece el documento con `embedding: Array(384)`.

### Paso 7 — Iniciar el backend

```bash
cd backend
npm run dev
```

El servidor inicia en: [http://localhost:3000](http://localhost:3000)

---

## 🔍 Cómo Funciona el Pipeline RAG

```
Usuario → POST /rag
    ↓
Genera embedding de la query (Xenova/all-MiniLM-L6-v2)
    ↓
$vectorSearch en colección chunks (Atlas Vector Search)
    ↓
Recupera los k chunks más similares filtrados por estrategia_chunking
    ↓
Construye prompt con contexto recuperado
    ↓
Groq API → Llama 3.3 70B Versatile
    ↓
Respuesta + referencias devueltas al usuario
```

---

## 🧩 Estrategias de Chunking

| Estrategia | Tamaño | Overlap | Cuándo usar |
|---|---|---|---|
| `fixed-size` | 256 tokens | 32 tokens | Baseline. Textos homogéneos. |
| `sentence-aware` | Máx. 5 oraciones | 1 oración | Textos narrativos (reglas, descripciones). **Recomendada para DrakoBets.** |
| `semantic` | Variable | Por umbral coseno 0.8 | Documentos con cambios de tema. |

Para especificar la estrategia al ingestar:

```javascript
await ingestDocument(db, documento, { strategy: 'sentence-aware' });
await ingestDocument(db, documento, { strategy: 'fixed-size' });
await ingestDocument(db, documento, { strategy: 'semantic' });
```

---

## 🌐 Endpoints de la API

### `POST /api/rag`
Consulta RAG completa con generación de respuesta.

```json
// Request
{ "query": "¿Cuáles son las reglas del blackjack?" }

// Response
{
  "ok": true,
  "respuesta": "El blackjack es un juego de cartas...",
  "referencias": [
    { "chunk_texto": "...", "estrategia_chunking": "sentence-aware", "score": 0.91 }
  ]
}
```

### `POST /api/search`
Búsqueda híbrida vectorial con filtros de metadatos.

```json
// Request
{ "query": "slots con jackpot", "estrategia": "sentence-aware", "limit": 5 }

// Response
{ "ok": true, "resultados": [...] }
```

---

## 🗄️ Colecciones MongoDB

| Colección | Propósito | Estrategia |
|---|---|---|
| `chunks` | Fragmentos de texto con embeddings. Colección principal del RAG. | Referenced |
| `juegos` | Juegos de casino con reglas y metadatos. | Híbrida |
| `eventos_deportivos` | Eventos con competencia y deporte embebidos. | Híbrida |
| `imagenes` | Escudos y fotos con embeddings CLIP (512 dims). | Referenced |
| `usuarios` | Usuarios con bonos y transacciones embebidos. | Embedded |
| `apuestas` | Apuestas de casino y deportivas unificadas. | Híbrida |
| `consultas` | Historial de consultas RAG con respuestas del LLM. | Embedded |

---

## ⚠️ Notas Importantes

- El servidor de embeddings (puerto 5005) **debe estar corriendo** antes de ejecutar cualquier ingesta o consulta RAG.
- Los índices `knnVector` solo se pueden crear desde **Atlas UI o la API de Atlas** — no desde el driver de Node.js.
- Si cambias el modelo de embeddings, debes **regenerar todos los chunks** en la colección.
- El `.env` nunca debe subirse a Git. Verifica que está en `.gitignore`.
- Para el experimento de chunking, usa el parámetro `estrategia` en el body del POST /rag para comparar las tres estrategias con las mismas consultas.

---

## 👥 Integrantes

| Nombre | 
|---|
| Jhoan Sebastian Velez Montes |
| Jaider León Diaz |

**Materia:** Bases de Datos No Relacionales  
**Repositorio:** [github.com/londonodaniel230/drakobets_NR](https://github.com/londonodaniel230/drakobets_NR)