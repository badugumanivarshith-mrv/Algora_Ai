# Multi-Stage Production Dockerfile for Algora AI
# Stage 1: Build Frontend & Backend Bundles
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy full application source code
COPY . .

# Build Vite client and backend server bundle
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Minimalist Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root system user for security hardening
RUN addgroup -g 1001 -S algoragroup && \
    adduser -S algorauser -u 1001 -G algoragroup

# Copy compiled assets and dependency manifest
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Ensure uploads directory has correct write permissions for non-root user
RUN mkdir -p /app/public/uploads && \
    chown -R algorauser:algoragroup /app

USER algorauser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
