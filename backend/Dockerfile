FROM oven/bun:1

WORKDIR /app

# Install ALL deps — devDeps are required for @nestjs/cli (nest build)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Compile TypeScript directly — bypasses nest CLI to get clear error output
RUN ./node_modules/.bin/tsc -p tsconfig.build.json --listEmittedFiles

# Show what was actually produced
RUN find dist -type f 2>/dev/null || echo "dist/ is empty or missing"

# Fail the build loudly if the compiled entry-point is missing
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found after build" && exit 1)

ENV NODE_ENV=production
EXPOSE 3000

# Use bun runtime — handles both CJS and ESM output transparently
CMD ["bun", "dist/main.js"]
