# AI Services

FastAPI microservices for captioning, moderation, and embeddings. Each service exposes OpenAPI docs.

- Captioning: BLIP-compatible stub with Redis caching
- Moderation: simple text/image heuristic with pluggable external calls
- Embeddings: sentence embeddings with vector DB integration (pgvector example)

Swap to managed APIs by calling providers in the service code.