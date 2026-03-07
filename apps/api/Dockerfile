FROM node:22-alpine

# Instala openssl, que é necessário para o Prisma no Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Copy everything (monorepo)
COPY . .

# Install ALL dependencies (including devDependencies for tsc)
RUN npm install --include=dev

# Build shared package first
RUN npm run build -w packages/shared

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the API
RUN npm run build -w apps/api

# Verify dist was created
RUN ls -la apps/api/dist/ && test -f apps/api/dist/index.js

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
