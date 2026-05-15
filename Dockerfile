# --- STAGE 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılıkları yükle
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Kaynak kodu kopyala ve build al
COPY . .
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: Runtime ---
FROM node:20-alpine

WORKDIR /app

# Sadece gerekli dosyaları builder'dan kopyala
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./ 

# Portu dışarı aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
