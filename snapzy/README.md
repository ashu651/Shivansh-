# Snapzy Monorepo

An advanced, secure, and scalable social app with a designer-grade UI.

- Frontend: Next.js 14 (App Router), TailwindCSS, shadcn/ui primitives, React Query, Zustand
- Backend: NestJS 10, REST + GraphQL, Prisma + PostgreSQL, Redis, Socket.IO
- AI Services: Python FastAPI microservices (captioning, moderation, embeddings)
- Infra: Docker Compose (dev), Kubernetes manifests (infra/k8s), GitHub Actions CI/CD

## Quick start

Prereqs: Node 18+, pnpm 9+, Docker

1. Copy env

```bash
cp .env.example .env
```

2. Boot dev stack

```bash
make dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api
- API Docs: http://localhost:4000/api/docs
- Captioning: http://localhost:8001/docs
- Moderation: http://localhost:8002/docs
- Embeddings: http://localhost:8003/docs

3. Apply migrations & seed

```bash
make migrate
make seed
```

4. Run tests

```bash
pnpm -r test
```

## Production hardening checklist

- Configure secrets (JWT, OAuth, Cloudinary, Sentry)
- Enable HTTPS and secure cookies behind a proxy
- Set strong CORS and CSP headers
- Tune rate limits per route and per IP
- Backups for Postgres and Redis; object storage lifecycle policies
- SLOs & alerts in Grafana/Prometheus; Sentry alerting
- Rotate refresh tokens regularly and set TTLs

## Repo layout

See the repository tree for apps, packages, services, and infra.

## Backlog (post-MVP)

- Advanced search with embeddings and semantic ranking (8)
- Full Stories authoring, viewer, and TTL cleanup worker (5)
- Admin moderation console with audit log UI (8)
- Video reels with HLS transcoding pipeline and ABR (13)
- Federation for DMs with Matrix-compatible bridge (13)
- iOS/Android app via Expo with push notifications (13)