# Lightweight Production Docker Container for AI Job Copilot
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "web/server.js"]
