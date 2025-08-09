# Snapzy API (NestJS)

## Run

```bash
pnpm install
pnpm prisma migrate deploy
pnpm start:dev
```

- Swagger: /api/docs
- Health: /health/liveness, /health/readiness
- Metrics: /metrics

## Environment

See `.env.example` in repo root.

## Worker

Background worker runs from the same image:

```bash
pnpm build && pnpm start:worker
```