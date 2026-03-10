#!/bin/sh
set -e

echo "🔄 Sincronizando banco de dados com Prisma..."
# Tenta rodar o push. Se falhar, o container não sobe, evitando inconsistências.
npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss

echo "🚀 Iniciando API..."
node apps/api/dist/index.js
