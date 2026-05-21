# --- STAGE 1: Build ---
FROM node:20-alpine AS builder

# Prisma query engine (Alpine musl + OpenSSL 3)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY schema.prisma ./
COPY migrations ./migrations/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build

# --- STAGE 2: Runtime ---
FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/schema.prisma ./
COPY --from=builder /app/migrations ./migrations/

# Ortam değişkenleri runtime'da verilir (.env image'a gömülmez)
EXPOSE 3000

CMD ["npm", "start"]
