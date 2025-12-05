from pymongo import MongoClient
from transformers import AutoTokenizer, AutoModel
import torch

MONGO_URI = "mongodb+srv://juan1702011916:Lupe@drakobets.sm7rm2c.mongodb.net/?appName=DrakoBets"
DB_NAME = "Proyecto"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

CHUNKS = db["rag_chunks"]

TOKENIZER = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
MODEL = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

def embed(text):
    tokens = TOKENIZER(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        output = MODEL(**tokens)
    return output.last_hidden_state.mean(dim=1).squeeze().tolist()

CONFIG = {
    "premio": ["descripcionpremio"],
    "evento": ["estadisticas"],
    "competencia": ["descripcion"],
    "juego": ["descripcionjuego", "reglasjuego"]
}

for col_name, fields in CONFIG.items():
    col = db[col_name]

    print(f"\nProcesando colección: {col_name}")
    for doc in col.find({}):
        for field in fields:

            value = doc.get(field)
            if not value:
                continue

            text = str(value)

            vector = embed(text)

            CHUNKS.insert_one({
                "source": col_name,
                "field": field,
                "source_id": doc["_id"],
                "texto": text,
                "embedding": vector,
                "metadata": doc
            })

            print(f"OK → {col_name}:{field} → {doc['_id']}")

print("\n✔ Embeddings de TEXTO generados correctamente.")
