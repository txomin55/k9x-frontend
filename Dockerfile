# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Build stage: install workspace deps and build the static SPA
# ─────────────────────────────────────────────────────────────
FROM node:24.11.1-slim AS build

# Which env/mode Vite builds with (see ui/app/.env.*).
# production -> real API; standalone -> mock API; staging -> gh-pages base path.
ARG CI_BUILD_ENV=production
ENV CI_BUILD_ENV=${CI_BUILD_ENV}

# pnpm via Corepack, pinned to the repo's packageManager version.
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

WORKDIR /app

# Copy manifests first for better layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY ui/app/package.json ui/app/
COPY ui/library/package.json ui/library/
COPY configuration/my-vitest/package.json configuration/my-vitest/
COPY configuration/my-eslint/package.json configuration/my-eslint/
COPY coverage_processor/package.json coverage_processor/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the rest of the source and build.
COPY . .

RUN pnpm build

# ─────────────────────────────────────────────────────────────
# Runtime stage: serve the static output with nginx
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/ui/app/.output/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
