# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter backend build

FROM base AS runner
ENV NODE_ENV=production
RUN corepack enable

COPY --from=deps  /app/node_modules                 ./node_modules
COPY --from=deps  /app/apps/backend/node_modules    ./apps/backend/node_modules
COPY --from=build /app/apps/backend/dist            ./apps/backend/dist
COPY apps/backend/package.json                      apps/backend/

EXPOSE 3000
CMD ["node", "apps/backend/dist/main.js"]