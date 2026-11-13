#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
stage="$1"
app="$HOME/strapi_media360"
cd "$app"
cp src/api/rhp-finance/policies/finance-staff.js "src/api/rhp-finance/policies/finance-staff.js.$(date +%s).bak"
node - "$stage/src/Pages/Dog.jsx" <<'NODE'
const fs=require('fs'),crypto=require('crypto');
const source=fs.readFileSync(process.argv[2],'utf8');
const match=source.match(/const CORRECT_PASSWORD = '([^']+)'/);
if(!match)throw Error('Portal password definition not found');
fs.writeFileSync('.rhp-finance-portal.sha256',crypto.createHash('sha256').update(match[1]).digest('hex'),{mode:0o600});
NODE
cp "$stage/backend/strapi/src/api/rhp-finance/policies/finance-staff.js" src/api/rhp-finance/policies/
pm2 restart strapi-media360-dev >/dev/null
node - "$stage/src/Pages/Dog.jsx" <<'NODE'
const fs=require('fs');const password=fs.readFileSync(process.argv[2],'utf8').match(/const CORRECT_PASSWORD = '([^']+)'/)[1];
(async()=>{for(let i=0;i<60;i++){try{const r=await fetch('http://127.0.0.1:1337/api/rhp-finance',{headers:{Authorization:`Bearer ${password}`}});if(r.ok){console.log('PORTAL_FINANCE_AUTH_OK');const denied=await fetch('http://127.0.0.1:1337/api/rhp-finance');if(denied.status!==403)throw Error('Access protection failed');return;}}catch{}await new Promise(r=>setTimeout(r,2000));}throw Error('Portal finance authentication failed');})().catch(e=>{console.error(e.message);process.exitCode=1});
NODE
