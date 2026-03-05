FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy workspace package.json files
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Install all dependencies
RUN npm install

# Copy all source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

# Build shared package first
RUN npm run build -w packages/shared

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the API
RUN npm run build -w apps/api

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 4000

# Start
CMD ["npm", "run", "start", "-w", "apps/api"]
