# ---- Stage 1: 安裝依賴 ----
FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build pnpm exec prisma generate

# ---- Stage 2: 建置 ----
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ---- Stage 3: 執行 ----
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json /app/prisma.config.ts ./

USER nestjs

EXPOSE 3004
ENV PORT=3004

CMD ["node", "dist/main"]
