FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL 1.1 (necessário para Prisma no Alpine)
RUN apk add --no-cache openssl1.1-compat

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar cliente do Prisma com binário correto para Alpine
RUN npx prisma generate

# Copiar resto do código
COPY . .

# Build do frontend
RUN npm run build

# Expor porta do servidor
EXPOSE 3001

# Comando de inicialização
CMD ["node", "server/index.js"]
