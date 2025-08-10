from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Moderation Service", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

BAD_WORDS = {"hate", "terror", "nsfw"}

class ModerationInput(BaseModel):
    text: str | None = None
    imageUrl: str | None = None
    videoUrl: str | None = None

class ModerationResponse(BaseModel):
    flagged: bool
    categories: list[str]

@app.post("/moderate", response_model=ModerationResponse)
async def moderate(inp: ModerationInput):
    categories: list[str] = []
    flagged = False
    if inp.text:
        lower = inp.text.lower()
        for w in BAD_WORDS:
            if w in lower:
                categories.append("text_toxicity")
                flagged = True
                break
    if inp.imageUrl:
        # Simple stub: flag if url contains nsfw
        if "nsfw" in inp.imageUrl.lower():
            categories.append("image_nsfw")
            flagged = True
    if inp.videoUrl:
        if "nsfw" in inp.videoUrl.lower():
            categories.append("video_nsfw")
            flagged = True
    return ModerationResponse(flagged=flagged, categories=categories)

@app.get("/health")
async def health():
    return {"ok": True}