FROM node:22-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 compiles a native binding at install time
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

# package-lock.json is generated on Windows and pins Windows-only native
# optional deps (lightningcss, etc). npm doesn't reliably backfill the
# correct binary for a different platform/arch from a foreign lockfile, so
# skip it here and let npm resolve native deps fresh for the build platform.
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Drop devDependencies now that the build output exists
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "build"]
