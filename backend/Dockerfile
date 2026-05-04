# ---- Stage 1: Build ----
FROM oven/bun:1 AS builder

WORKDIR /app

# Install ALL deps (including devDeps — needed for @nestjs/cli)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and compile
COPY . .
RUN bun run build

# ---- Stage 2: Production runtime ----
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Install production-only deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

EXPOSE 3000

CMD ["node", "dist/main"]
