FROM node:22-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 compiles a native binding at install time
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# npm install (not ci) because package-lock.json was generated on Windows and
# only pins the win32 lightningcss/native binaries — install recalculates the
# correct platform-specific optional deps (e.g. lightningcss-linux-x64-gnu) for Linux.
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
