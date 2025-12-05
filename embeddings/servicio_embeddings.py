from fastapi import FastAPI
from pydantic import BaseModel
from transformers import CLIPProcessor, CLIPModel
from sentence_transformers import SentenceTransformer
import base64, torch
from PIL import Image
import io

app = FastAPI()

device = "cuda" if torch.cuda.is_available() else "cpu"

# modelos
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
clip_proc = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
text_model = SentenceTransformer("all-MiniLM-L6-v2")

class TextInput(BaseModel):
    text: str

class ImageInput(BaseModel):
    image: str  # base64

@app.post("/embed/text")
def embed_text(payload: TextInput):
    v = text_model.encode(payload.text).tolist()
    return {"embedding": v}

@app.post("/embed/image")
def embed_image(payload: ImageInput):
    img = Image.open(io.BytesIO(base64.b64decode(payload.image))).convert("RGB")
    inputs = clip_proc(images=[img], return_tensors="pt")

    with torch.no_grad():
        emb = clip_model.get_image_features(inputs["pixel_values"].to(device))

    emb = emb / emb.norm()
    return {"embedding": emb.cpu().numpy()[0].tolist()}
