# Backend Dockerfile - Sistema Financeiro Empresarial
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm run build:server

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy built application
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/package.json ./package.json
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/shared/node_modules ./shared/node_modules

# Change ownership to non-root user
RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
