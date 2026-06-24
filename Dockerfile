# ── Build stage ──────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS from build stage
COPY --from=builder /app/dist ./dist

# Copy migration & seed files (needed for sequelize-cli)
COPY .sequelizerc ./
COPY migrations/ ./migrations/
COPY seeders/ ./seeders/
COPY src/config/sequelize-cli-config.js ./src/config/sequelize-cli-config.js

EXPOSE 3000

CMD ["node", "dist/index.js"]
