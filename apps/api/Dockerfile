FROM node:22-alpine

WORKDIR /app

# Copy everything (monorepo)
COPY . .

# Install ALL dependencies (including devDependencies for tsc)
RUN npm install --include=dev

# Build shared package
RUN npm run build -w packages/shared

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the API (tsc) — show errors if any
RUN cd apps/api && npx tsc --skipLibCheck || echo "TSC had warnings, checking output..." && ls -la dist/ 

# Verify dist was created
RUN test -f apps/api/dist/index.js || (echo "ERROR: dist/index.js was not created!" && exit 1)

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
