FROM node:20-slim

WORKDIR /app

# Instalar OpenSSL (necessário para Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar cliente do Prisma
RUN npx prisma generate

# Copiar resto do código
COPY . .

# Build do frontend
RUN npm run build

# Expor porta do servidor
EXPOSE 3001

# Comando de inicialização
CMD ["node", "server/index.js"]
