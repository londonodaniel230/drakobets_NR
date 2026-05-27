from fastapi import FastAPI
from pydantic import BaseModel
from transformers import CLIPProcessor, CLIPModel
from sentence_transformers import SentenceTransformer
import base64, torch
from PIL import Image
import io
import torch.nn.functional as F

app = FastAPI()

device = "cuda" if torch.cuda.is_available() else "cpu"

clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
clip_proc  = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
text_model = SentenceTransformer("all-MiniLM-L6-v2")

class TextInput(BaseModel):
    text: str

class ImageInput(BaseModel):
    image: str

class TextCLIPInput(BaseModel):
    text: str

@app.post("/embed/text")
def embed_text(payload: TextInput):
    v = text_model.encode(payload.text).tolist()
    return {"embedding": v}

@app.post("/embed/image")
def embed_image(payload: ImageInput):
    img = Image.open(io.BytesIO(base64.b64decode(payload.image))).convert("RGB")
    inputs = clip_proc(images=[img], return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(device)
    with torch.no_grad():
        vision_outputs = clip_model.vision_model(pixel_values=pixel_values)
        pooled = vision_outputs.pooler_output
        emb = clip_model.visual_projection(pooled)
    emb = F.normalize(emb, p=2, dim=-1)
    return {"embedding": emb.cpu().numpy()[0].tolist()}

@app.post("/embed/text-clip")
def embed_text_clip(payload: TextCLIPInput):
    inputs = clip_proc(text=[payload.text], return_tensors="pt", padding=True, truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = clip_model.text_model(**inputs)
        pooled = outputs.pooler_output
        emb = clip_model.text_projection(pooled)
    emb = F.normalize(emb, p=2, dim=-1)
    return {"embedding": emb.cpu().numpy()[0].tolist()}