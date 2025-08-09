SHELL := /usr/bin/bash

.PHONY: dev build test migrate seed down fmt

dev:
	docker-compose up --build

build:
	docker-compose build

down:
	docker-compose down -v

migrate:
	bash ./scripts/migrate.sh

seed:
	pnpm --filter @snapzy/api exec ts-node --transpile-only ../../scripts/seed.ts

test:
	pnpm -r test

fmt:
	pnpm -r prettier --write .