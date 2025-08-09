# Snapzy API (NestJS)

## Run

```bash
pnpm install
pnpm prisma migrate deploy
pnpm start:dev
```

- REST: /api/v1/*
- Swagger: /api/docs
- GraphQL: /graphql (Apollo)
- Health: /health/liveness, /health/readiness
- Metrics: /metrics

## Admin routes (RBAC)

- GET /api/v1/admin/audit-logs
- GET /api/v1/admin/reports
- POST /api/v1/admin/reports/:id/resolve { action?: 'hide_post' }
- PATCH /api/v1/admin/users/:id/role/:role

## Environment

See `.env.example` in repo root.

## Worker

Background worker runs from the same image:

```bash
pnpm build && pnpm start:worker
```