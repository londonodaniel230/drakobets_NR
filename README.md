🐉 DrakoBets – Sistema RAG con MongoDB + Groq + Embeddings locales (Xenova)

Repositorio: Drakobets_NR
Versión: 1.0.0

Este proyecto implementa un sistema de Recuperación Aumentada por Generación (RAG) usando:

MongoDB Atlas (Vector Search)

Node.js + Express

Embeddings locales (Xenova/all-MiniLM-L6-v2)

Groq Llama 3.3 70B Versatile como modelo generativo

Frontend estático estilo DrakoBets

El sistema permite consultar información almacenada en múltiples colecciones mediante búsqueda vectorial y generar respuestas con contexto.

📁 Estructura del Proyecto
Drakobets_NR/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   ├── controllers/
│   │   │   ├── rag_controller.js
│   │   ├── routes/
│   │   │   ├── rag.routes.js
│   │   ├── app.js
│   │   ├── server.js
│   │
│   ├── public/   ← (Frontend servido por el backend)
│       ├── index.html
│       ├── css/styles.css
│       ├── js/app.js
│       └── assets/logo.png
│
├── embeddings/
│   ├── text/
│   │   ├── generar_embeddings_texto.py
│   ├── image/
│       ├── generar_embeddings_imagenes.py
│
└── README.md

🔧 Requisitos Previos
Software
Requerimiento	Versión recomendada
Node.js	18+
Python	3.10+
MongoDB Atlas	Vector Search habilitado
Cuenta en Groq	API Key activa
🔐 Variables de Entorno

En la raíz del backend crear un archivo:

.env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=Proyecto
GROQ_API_KEY=tu_api_key_de_groq


⚠️ Importante: El .env NO va dentro de /src, debe ir en /backend.

📦 Instalar dependencias

📌 Desde la carpeta /backend:

npm install


Dependencias principales instaladas:

express

mongodb

groq-sdk

dotenv

@xenova/transformers

nodemon

🧠 Generación de Embeddings

Antes de usar el sistema, debes generar los embeddings:

1️⃣ Embeddings de texto

Ejecutar:

cd embeddings/text
python generar_embeddings_texto.py


Esto generará documentos en la colección:

rag_chunks


Con estructura:

{
  source: "...",
  field: "...",
  texto: "...",
  embedding: [384 valores],
  metadata: {...}
}

2️⃣ Embeddings de imágenes (Opcional)
cd embeddings/image
python generar_embeddings_imagenes.py


Se guardan en:

rag_media

🗄️ Índices vectoriales en MongoDB

Debes crear 2 índices:

vector_text (colección: rag_chunks)
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}

vector_media (colección: rag_media)
{
  "fields": [
    {
      "type": "vector",
      "path": "image_embedding",
      "numDimensions": 512,
      "similarity": "cosine"
    }
  ]
}

🚀 Correr la Aplicación Completa
1️⃣ Iniciar el backend

Dentro de /backend:

npm run dev


El servidor inicia en:

http://localhost:3000


Automáticamente sirve el frontend.

🌐 Acceder al Frontend

Una vez corriendo el backend:

👉 Abre tu navegador en:

http://localhost:3000


El frontend cargará:

Entrada de texto

Botón de consulta

Respuesta generada por Groq

Referencias del RAG (opcional)

🔍 Cómo funciona el flujo RAG

1️⃣ El usuario envía una pregunta
2️⃣ El backend genera un embedding con Xenova
3️⃣ Se busca en rag_chunks usando $vectorSearch
4️⃣ Se construye un contexto con los documentos más relevantes
5️⃣ Se envía a Llama 3.3 70B de Groq
6️⃣ Se devuelve una respuesta precisa basada en tus datos

🧪 Endpoints Disponibles
🔹 POST /api/rag

Consulta RAG completa.

Request:
{
  "query": "¿Qué premios tiene el usuario?"
}

Response:
{
  "ok": true,
  "respuesta": "...",
  "referencias": [...]
}

🎯 Notas Importantes

El backend NO usa CORS, el frontend es servido directamente por Express.

Si cambias el modelo de embeddings, debes regenerar TODOS los embeddings.

Groq NO soporta embeddings → por eso usamos Xenova.

Si rag_media está vacío, el sistema usará solo texto (normal).

🐉 DrakoBets – Ready to Play

Este sistema está preparado para:

✔ Recuperación contextual
✔ Respuestas precisas basadas en tus colecciones reales
✔ Extensión futura para imágenes
✔ Integración con panel administrativo
✔ Versionamiento profesional