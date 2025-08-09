FROM node:20-alpine as deps
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile || pnpm install

FROM node:20-alpine as builder
WORKDIR /usr/src/app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm prisma:generate
RUN pnpm build

FROM node:20-alpine as runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
EXPOSE 4000
CMD ["node","dist/src/main.js"]