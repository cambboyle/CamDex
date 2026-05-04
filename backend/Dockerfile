FROM oven/bun:1

WORKDIR /app

# Install ALL deps — devDeps are required for tsc
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Compile TypeScript — tsc preserves src/ prefix, output lands at dist/src/main.js
RUN ./node_modules/.bin/tsc -p tsconfig.build.json

# Fail the build loudly if the compiled entry-point is missing
RUN test -f dist/src/main.js || (echo "ERROR: dist/src/main.js not found after build" && exit 1)

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "dist/src/main.js"]
