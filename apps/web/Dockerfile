FROM node:22-alpine

WORKDIR /app

# Copia tudo (monorepo)
COPY . .

# Instala todas as dependências (necessário para o build)
RUN npm install --include=dev

# Constrói o pacote compartilhado primeiro
RUN npm run build -w packages/shared

# Constrói o frontend (Web)
RUN npm run build -w apps/web

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Inicia o servidor do Next.js
CMD ["npm", "run", "start", "-w", "apps/web"]
