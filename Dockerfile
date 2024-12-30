# Build stage
FROM node:21.7.3-alpine AS builder

# Build arguments
ARG NODE_ENV=production
ARG BUILD_DATE
ARG VCS_REF

# Labels
LABEL org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.licenses="MIT"

# Set working directory
WORKDIR /app

# Copy built files from CI
COPY dist/ ./dist/
COPY package*.json ./

# Install only production dependencies and clean npm cache
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Production stage
FROM node:21.7.3-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set user
USER node

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]