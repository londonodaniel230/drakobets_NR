import os
import io
import requests
import numpy as np
from PIL import Image
from pymongo import MongoClient
from transformers import CLIPModel, CLIPProcessor

# ===============================
# CONFIG
# ===============================
MONGO_URI = "mongodb+srv://juan1702011916:Lupe@drakobets.sm7rm2c.mongodb.net/?appName=DrakoBets"
DB_NAME = "Proyecto"
COLLECTION = "rag_media"
DIM = 512   # CLIP base patch32 siempre produce 512 dims

# CONECTAR A MONGO
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db[COLLECTION]

# =================================
# CARGAR MODELO CLIP
# =================================
print("Cargando modelo CLIP...")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")

# =================================
# LISTA DE DOCUMENTOS A PROCESAR
# =================================
# Deben venir de tus colecciones reales
targets = [
    ("jugadores", "foto"),
    ("equipos", "escudo"),
    ("competencias", "logo")
]

def get_image_embedding(url):
    try:
        response = requests.get(url, timeout=10)
        img = Image.open(io.BytesIO(response.content)).convert("RGB")

        inputs = processor(images=img, return_tensors="pt")
        outputs = model.get_image_features(**inputs)

        vec = outputs.detach().numpy()[0]
        vec = vec / np.linalg.norm(vec)   # normalizar
        return vec.tolist()

    except Exception as e:
        print(f"Error procesando imagen {url} -> {e}")
        return None


# =================================
# PROCESAR TODAS LAS ENTIDADES
# =================================
for col_name, img_field in targets:

    print(f"\nProcesando colección: {col_name}")

    docs = db[col_name].find({img_field: {"$exists": True}})

    for doc in docs:

        url = doc.get(img_field)
        if not url:
            continue

        emb = get_image_embedding(url)
        if emb is None:
            continue

        new_doc = {
            "source": col_name,
            "field": img_field,
            "entity_id": str(doc["_id"]),
            "url": url,
            "image_embedding": emb
        }

        col.insert_one(new_doc)
        print(f"✔ Insertado embedding de {col_name} / {img_field}")

print("Finalizado.")
