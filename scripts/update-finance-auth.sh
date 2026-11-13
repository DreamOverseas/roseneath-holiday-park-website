#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
stage="$1"
app="$HOME/strapi_media360"
cd "$app"
backup="$HOME/rhp-finance-backups/cm-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup"
tar -czf "$backup/finance-source.tar.gz" src/api/rhp-finance src/api/rhp-finance-event
pm2 stop strapi-media360-dev >/dev/null
trap 'pm2 restart strapi-media360-dev >/dev/null || true' EXIT
cp -a .tmp "$backup/database"
test -s .rhp-finance-portal.sha256
node <<'NODE'
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const target='.rhp-admin-platforms.json';
if(!fs.existsSync(target)) {
  const source=execFileSync('git',['show','194fc11:src/Components/Admin/PlatformManager.jsx'],{cwd:path.join(process.env.HOME,'roseneath-holiday-park-website'),encoding:'utf8'});
  const match=source.match(/const platformData = (\[[\s\S]*?\n\]);/);
  if(!match)throw Error('Original platform credentials not found');
  // Parse the static object literal from the previously deployed, owned source; never execute it.
  const json=match[1].replace(/\b(name|email|password|url|note):/g,'"$1":').replace(/,\s*([}\]])/g,'$1');
  const platforms=JSON.parse(json);
  fs.writeFileSync(target,JSON.stringify(platforms),{mode:0o600,flag:'wx'});
}
NODE
cp "$stage/backend/strapi/src/api/rhp-finance-event/content-types/rhp-finance-event/schema.json" src/api/rhp-finance-event/content-types/rhp-finance-event/
cp "$stage/backend/strapi/src/api/rhp-finance-event/content-types/rhp-finance-event/lifecycles.js" src/api/rhp-finance-event/content-types/rhp-finance-event/
cp src/api/rhp-finance/policies/finance-staff.js "src/api/rhp-finance/policies/finance-staff.js.$(date +%s).bak"
cp -a "$stage/backend/strapi/src/api/rhp-finance/." src/api/rhp-finance/
pm2 restart strapi-media360-dev >/dev/null
node <<'NODE'
// Read the previous known deployment in server-local Git memory for a password-preservation test.
// Neither the credential nor the issued session is printed or stored.
const {execFileSync}=require('child_process');
const path=require('path');
const previous=execFileSync('git',['show','194fc11:src/Pages/Dog.jsx'],{cwd:path.join(process.env.HOME,'roseneath-holiday-park-website'),encoding:'utf8'});
const password=previous.match(/const CORRECT_PASSWORD = '([^']+)'/)[1];
(async()=>{for(let i=0;i<60;i++){
  try {
    const login=await fetch('http://127.0.0.1:1337/api/rhp-admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
    if(login.ok){
      const {token}=await login.json();
      const headers={Authorization:`Bearer ${token}`};
      const finance=await fetch('http://127.0.0.1:1337/api/rhp-finance',{headers});
      if(!finance.ok)throw Error('Session rejected');
      const platforms=await fetch('http://127.0.0.1:1337/api/rhp-admin/platforms',{headers});
      if(!platforms.ok || !Array.isArray(await platforms.json()))throw Error('Platform account migration failed');
      const denied=await fetch('http://127.0.0.1:1337/api/rhp-finance');
      if(denied.status!==403)throw Error('Access protection failed');
      const platformDenied=await fetch('http://127.0.0.1:1337/api/rhp-admin/platforms');
      if(platformDenied.status!==403)throw Error('Platform access protection failed');
      await fetch('http://127.0.0.1:1337/api/rhp-admin/logout',{method:'POST',headers});
      const revoked=await fetch('http://127.0.0.1:1337/api/rhp-finance',{headers});
      if(revoked.status!==403)throw Error('Logout failed');
      console.log('SERVER_LOGIN_PASSWORD_UNCHANGED_SESSION_AND_LOGOUT_OK');return;
    }
  }catch{}
  await new Promise(r=>setTimeout(r,2000));
}throw Error('Portal authentication smoke test failed');})().catch(e=>{console.error(e.message);process.exitCode=1});
NODE
