#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
stage="$1"
app="$HOME/strapi_media360"
schema="$app/src/api/rhp-membership/content-types/rhp-membership/schema.json"
test -f "$schema"
test -f "$app/.tmp/data.db"
fingerprint=$( { cat "$schema"; find "$stage/backend/strapi/src/api/rhp-finance" -type f -print0 | sort -z | xargs -0 sha256sum; cat "$stage/scripts/initialize-member-settings.cjs"; } | sha256sum | cut -d' ' -f1)
stamp="$app/.rhp-member-settings-version"
if test -f "$stamp" && test "$(cat "$stamp")" = "$fingerprint"; then
  echo 'RHP_MEMBER_SETTINGS_ALREADY_INSTALLED'
  exit 0
fi
backup="$HOME/rhp-finance-backups/member-settings-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup"
tar -czf "$backup/source.tar.gz" -C "$app" src/api/rhp-membership src/api/rhp-finance
pm2 stop strapi-media360-dev >/dev/null
trap 'pm2 restart strapi-media360-dev >/dev/null || true' EXIT
cp -a "$app/.tmp" "$backup/database"
cd "$app"
node <<'NODE'
const fs = require('fs');
const file = 'src/api/rhp-membership/content-types/rhp-membership/schema.json';
const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
const fields = { TenantId: { type: 'string', maxLength: 80 }, OutstandingDebtA: { type: 'decimal', min: 0, default: 0 }, OutstandingDebtB: { type: 'decimal', min: 0, default: 3872 }, OutstandingDebtC: { type: 'decimal', min: 0, default: 1936 } };
for (const [field, definition] of Object.entries(fields)) {
  if (schema.attributes[field] && schema.attributes[field].type !== definition.type) throw Error(`Incompatible existing field ${field}`);
  // Keep finance fields out of the existing public membership Content API.
  schema.attributes[field] = { ...definition, ...schema.attributes[field], private: true };
}
fs.writeFileSync(file, JSON.stringify(schema, null, 2) + '\n');
NODE
cp -a "$stage/backend/strapi/src/api/rhp-finance/." src/api/rhp-finance/
node "$stage/scripts/initialize-member-settings.cjs" > "$backup/initialize.log" 2>&1 || { tail -40 "$backup/initialize.log"; exit 1; }
grep 'RHP_MEMBER_SETTINGS_OK' "$backup/initialize.log"
node "$stage/scripts/initialize-member-settings.cjs" > "$backup/idempotency.log" 2>&1 || { tail -40 "$backup/idempotency.log"; exit 1; }
grep 'RHP_MEMBER_SETTINGS_OK.*initialized=0' "$backup/idempotency.log"
pm2 restart strapi-media360-dev >/dev/null
trap - EXIT
node <<'NODE'
const fs = require('fs');
const tokens = JSON.parse(fs.readFileSync('.rhp-finance-staff.json', 'utf8'));
const token = Object.values(tokens)[0];
(async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch('http://127.0.0.1:1337/api/rhp-finance', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        if (!data.members.length || data.members.some(m => !m.TenantId || ['OutstandingDebtA', 'OutstandingDebtB', 'OutstandingDebtC'].some(k => m[k] == null))) throw Error('Missing saved membership settings');
        const denied = await fetch('http://127.0.0.1:1337/api/rhp-finance');
        if (![401, 403].includes(denied.status)) throw Error('Unauthenticated finance access was allowed');
        console.log(`RHP_MEMBER_SETTINGS_LIVE_OK members=${data.members.length}`); return;
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw Error('Membership settings health check failed');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
NODE
# Record the post-migration schema fingerprint, so subsequent identical deploys are no-ops.
{ cat "$schema"; find "$stage/backend/strapi/src/api/rhp-finance" -type f -print0 | sort -z | xargs -0 sha256sum; cat "$stage/scripts/initialize-member-settings.cjs"; } | sha256sum | cut -d' ' -f1 > "$stamp"
echo "RHP_MEMBER_SETTINGS_DEPLOYED backup=$backup"
