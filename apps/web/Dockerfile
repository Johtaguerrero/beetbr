# Step 1: Base image
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the monorepo
COPY . .

# Install dependencies and build
RUN npm install --include=dev
RUN npm run build -w packages/shared
RUN npm run build -w apps/web

# Step 2: Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# In standalone mode, Next.js packages all necessary files into .next/standalone
# This is much more efficient than copying the entire node_modules
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

# Run the standalone server
CMD ["node", "apps/web/server.js"]
