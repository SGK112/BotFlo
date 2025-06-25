# ChatFlo Production Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Remove development files
RUN rm -rf tests/ docs/ *.md .git/ .gitignore

# Production stage
FROM node:20-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S chatflo -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=chatflo:nodejs /usr/src/app .

# Create necessary directories
RUN mkdir -p logs uploads temp && \
    chown -R chatflo:nodejs logs uploads temp

# Set proper permissions
RUN chmod 755 logs uploads temp

# Switch to non-root user
USER chatflo

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]

# Labels for metadata
LABEL maintainer="ChatFlo Team <support@chatflo.com>"
LABEL version="2.0.0"
LABEL description="ChatFlo - Professional AI Chatbot Builder"
LABEL org.opencontainers.image.source="https://github.com/SGK112/chatflo"
LABEL org.opencontainers.image.documentation="https://github.com/SGK112/chatflo/blob/main/README.md"
LABEL org.opencontainers.image.licenses="MIT"

