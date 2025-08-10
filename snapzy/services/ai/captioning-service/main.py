from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib
import io
from PIL import Image
import asyncio
import redis

app = FastAPI(title="Captioning Service", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

r = redis.Redis.from_url("redis://redis:6379", decode_responses=True)

class CaptionResponse(BaseModel):
    caption: str
    confidence: float

lock = asyncio.Lock()

@app.post("/caption", response_model=CaptionResponse)
async def caption(image_url: str | None = Form(default=None), file: UploadFile | None = File(default=None)):
    key = None
    if image_url:
        key = f"cap:{hashlib.sha256(image_url.encode()).hexdigest()}"
    elif file:
        content = await file.read()
        key = f"cap:{hashlib.sha256(content).hexdigest()}"
    else:
        return CaptionResponse(caption="", confidence=0.0)

    cached = r.get(key)
    if cached:
        cap, conf = cached.split("|")
        return CaptionResponse(caption=cap, confidence=float(conf))

    async with lock:
        # Very naive heuristic caption as a placeholder
        if file:
            image = Image.open(io.BytesIO(content))
            width, height = image.size
            cap = f"An image of size {width}x{height}."
        else:
            cap = "A photo from the web."
        conf = 0.42
        r.setex(key, 3600, f"{cap}|{conf}")
        return CaptionResponse(caption=cap, confidence=conf)

@app.get("/health")
async def health():
    return {"ok": True}