#!/bin/sh
set -e

echo "🚀 Starting Twenty CRM (Optimized for Render Free Plan)..."

# 1. Run Database Migrations (Lightweight Mode)
# Using direct node execution to avoid npx/ts-node memory overhead
# Debug: List files to verify path
echo "📂 Listing dist directory..."
ls -R /app/packages/twenty-server/dist | head -n 50

echo "📦 Running migrations..."
node /app/node_modules/typeorm/cli.js migration:run -d /app/packages/twenty-server/dist/src/database/typeorm/core/core.datasource.js

# 2. Start the Server
echo "⚡ Starting server..."
node /app/packages/twenty-server/dist/src/main
