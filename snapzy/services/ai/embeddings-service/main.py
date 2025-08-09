from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="Embeddings Service", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class EmbedInput(BaseModel):
    text: str

class EmbedResponse(BaseModel):
    vector: list[float]

@app.post("/embed", response_model=EmbedResponse)
async def embed(inp: EmbedInput):
    # Very small embedding: hash-based deterministic vector
    rng = np.random.default_rng(abs(hash(inp.text)) % (2**32))
    vec = rng.random(128).astype(float).tolist()
    return {"vector": vec}

@app.get("/health")
async def health():
    return {"ok": True}