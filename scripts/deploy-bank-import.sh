#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
stage="$1"
app="$HOME/strapi_media360"
frontend="$HOME/roseneath-holiday-park-website"
backup="$HOME/rhp-finance-backups/bank-$(date -u +%Y%m%dT%H%M%SZ)"
test -f "$stage/import.json"
test -f "$app/.tmp/data.db"
test -d "$frontend/node_modules"
mkdir -p "$backup"
tar -czf "$backup/finance-source.tar.gz" -C "$app" src/api/rhp-finance src/api/rhp-finance-event
tar -czf "$backup/frontend.tar.gz" -C "$frontend" src/Components/Admin/FinanceDepartment.jsx src/Css/FinanceDepartment.css src/finance/store.js backend dist
pm2 stop strapi-media360-dev >/dev/null
trap 'pm2 restart strapi-media360-dev >/dev/null || true' EXIT
cp -a "$app/.tmp" "$backup/database"
for module in rhp-finance rhp-finance-event rhp-bank-transaction; do
  mkdir -p "$app/src/api/$module"
  cp -a "$stage/backend/strapi/src/api/$module/." "$app/src/api/$module/"
done
cd "$app"
node "$stage/scripts/import-bank-transactions.cjs" "$stage/import.json" > "$backup/import.log" 2>&1 || { tail -60 "$backup/import.log"; exit 1; }
grep 'RHP_IMPORT_OK' "$backup/import.log"
# An identical second run must add neither source rows nor tenant payments.
node "$stage/scripts/import-bank-transactions.cjs" "$stage/import.json" > "$backup/idempotency.log" 2>&1 || { tail -60 "$backup/idempotency.log"; exit 1; }
grep 'RHP_IMPORT_OK' "$backup/idempotency.log"
pm2 restart strapi-media360-dev >/dev/null
trap - EXIT
cd "$frontend"
cp "$stage/src/Components/Admin/FinanceDepartment.jsx" src/Components/Admin/
cp "$stage/src/Components/Admin/BankImportReview.jsx" src/Components/Admin/
cp "$stage/src/Css/FinanceDepartment.css" src/Css/
cp "$stage/src/finance/store.js" src/finance/
cp "$stage/src/finance/presentation.mjs" src/finance/
cp -a "$stage/backend/." backend/
npm run build > "$backup/frontend-build.log" 2>&1 || { tail -50 "$backup/frontend-build.log"; exit 1; }
tail -5 "$backup/frontend-build.log"
cd "$app"
node "$stage/scripts/verify-bank-import.cjs" "$stage/import.json"
echo "RHP_DEPLOY_COMPLETE backup=$backup"
