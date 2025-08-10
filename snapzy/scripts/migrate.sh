#!/usr/bin/env bash
set -euo pipefail

pushd ./apps/api >/dev/null
pnpm install
pnpm prisma migrate deploy
popd >/dev/null

echo "Migrations deployed"