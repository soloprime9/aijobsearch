FROM node:20-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3   CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "web/server.js"]
