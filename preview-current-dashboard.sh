#!/usr/bin/env bash
set -euo pipefail

BASE="https://raw.githubusercontent.com/matspectrum-ai/Swiftpay-Gateway-de-pagamentos/agent/foundation-phase-0/apps/dashboard"
rm -rf current-dashboard
mkdir -p current-dashboard/src

for file in package.json tsconfig.json vite.config.ts index.html; do
  curl --fail --silent --show-error --location "$BASE/$file" --output "current-dashboard/$file"
done

for file in api-base.ts api.ts app-base.tsx app.tsx auth.ts main.tsx styles.css; do
  curl --fail --silent --show-error --location "$BASE/src/$file" --output "current-dashboard/src/$file"
done

cd current-dashboard
npm install --include=dev --no-audit --no-fund
npm install --no-save --include=dev --no-audit --no-fund typescript@7.0.2
VITE_SUPABASE_URL="https://preview.invalid.supabase.co" \
VITE_SUPABASE_PUBLISHABLE_KEY="preview-public-key" \
npm run build
