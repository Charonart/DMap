# ═══════════════════════════════════════════
# DMap Backend — Node.js / Express
# ═══════════════════════════════════════════
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
