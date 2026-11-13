#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
app="$HOME/strapi_media360"
source_dir="$1"
backup="$HOME/rhp-finance-backups/$(date -u +%Y%m%dT%H%M%SZ)"
test -f "$app/.tmp/data.db"
test -f "$app/node_modules/@strapi/strapi/package.json"
mkdir -p "$backup"
tar -czf "$backup/source.tar.gz" -C "$app" src config package.json package-lock.json .env
for name in rhp-finance rhp-finance-event; do
  if test -e "$app/src/api/$name"; then echo "Finance module already exists; refusing to overwrite without review"; exit 1; fi
done
pm2 stop strapi-media360-dev
trap 'pm2 restart strapi-media360-dev >/dev/null || true' EXIT
cp -a "$app/.tmp" "$backup/database"
cp -a "$source_dir/backend/strapi/src/api/rhp-finance" "$app/src/api/"
cp -a "$source_dir/backend/strapi/src/api/rhp-finance-event" "$app/src/api/"
cd "$app"
node <<'NODE'
const fs=require('fs'),crypto=require('crypto');
const file='.rhp-finance-staff.json';
if(!fs.existsSync(file)) fs.writeFileSync(file,JSON.stringify({Joshua:crypto.randomBytes(32).toString('hex')}),{mode:0o600,flag:'wx'});
NODE
pm2 restart strapi-media360-dev
node <<'NODE'
const fs=require('fs');
const code=Object.values(JSON.parse(fs.readFileSync('.rhp-finance-staff.json','utf8')))[0];
(async()=>{
  for(let i=0;i<60;i++) {
    try {
      const response=await fetch('http://127.0.0.1:1337/api/rhp-finance',{headers:{Authorization:`Bearer ${code}`}});
      if(response.ok){const data=await response.json();if(!Array.isArray(data.members)||!data.accounts)throw Error('Invalid contract');console.log('FINANCE_AUTHENTICATED_OK tenant_count='+data.members.length);const denied=await fetch('http://127.0.0.1:1337/api/rhp-finance');if(![401,403].includes(denied.status))throw Error('Unauthenticated access not denied');console.log('FINANCE_UNAUTHENTICATED_DENIED');return;}
    } catch{}
    await new Promise(resolve=>setTimeout(resolve,2000));
  }
  throw Error('Finance health check failed; source and SQLite backup retained on server');
})().catch(e=>{console.error(e.message);process.exitCode=1});
NODE
echo "Finance installed. Backup: $backup. Staff access file: $app/.rhp-finance-staff.json (not logged)."
