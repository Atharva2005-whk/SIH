# Multi-stage build for Smart Tourist Safety API
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy root package files
COPY ../package*.json ./
COPY ../tsconfig.json ./

# Copy shared module
COPY ../shared ./shared
WORKDIR /app/shared
RUN npm ci --only=production && npm run build

# Copy backend source
WORKDIR /app
COPY ./backend ./backend
WORKDIR /app/backend

# Install dependencies and build
RUN npm ci --only=production
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk --no-cache upgrade

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/package.json ./package.json

# Copy shared module
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/shared/package.json ./shared/package.json

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/api.js"]
