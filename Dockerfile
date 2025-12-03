# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ekilex -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Set ownership to non-root user
RUN chown -R ekilex:nodejs /app

# Switch to non-root user
USER ekilex

# Environment variables with defaults
ENV NODE_ENV=production
ENV MCP_TRANSPORT=stdio
ENV MCP_HTTP_PORT=3000
ENV MCP_HTTP_HOST=0.0.0.0
ENV LOG_LEVEL=info

# Expose HTTP port (only used when MCP_TRANSPORT=http)
EXPOSE 3000

# Health check for HTTP transport
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD if [ "$MCP_TRANSPORT" = "http" ]; then wget --no-verbose --tries=1 --spider http://localhost:${MCP_HTTP_PORT}/health || exit 1; else exit 0; fi

# Run the server
CMD ["node", "dist/index.js"]
