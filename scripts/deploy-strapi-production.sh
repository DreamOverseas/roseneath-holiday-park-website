#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

stage=$(realpath "${1:?Usage: deploy-strapi-production.sh SOURCE [BANK_IMPORT_JSON]}")
bank_import="${2:-}"
if [[ -n "$bank_import" ]]; then
  bank_import=$(realpath "$bank_import")
  test -s "$bank_import"
fi

scripts=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
unit=strapi-media360.service
service_user=strapi-svc
source_root="$stage/backend/strapi/src/api"
modules=(rhp-finance rhp-finance-event rhp-bank-transaction)
membership=src/api/rhp-membership/content-types/rhp-membership/schema.json
app=$(systemctl show --value -p WorkingDirectory "$unit")
group=$(systemctl show --value -p Group "$unit")
node=$(systemctl show --value -p ExecStart "$unit" | sed -n 's/^{ path=\([^ ;]*\) .*/\1/p')

[[ -n "$app" && "$group" == "$service_user" && "$node" == /* && -x "$node" ]]
[[ "$(systemctl show --value -p User "$unit")" == "$service_user" ]]
[[ "$(systemctl show --value -p NoNewPrivileges "$unit")" == yes ]]
cd "$app"
test -f .tmp/data.db
test -f "$membership"
for module in "${modules[@]}"; do
  test -d "$source_root/$module"
  test -d "src/api/$module"
  unsupported=$(find "$source_root/$module" ! -type f ! -type d -print -quit)
  [[ -z "$unsupported" ]]
done

exec 9>.tmp/rhp-finance-deploy.lock
flock -w 60 9
systemctl is-active --quiet "$unit"

as_service() {
  sudo -n -u "$service_user" -g "$group" "$@"
}

verify_permissions() {
  local module dir file
  as_service test -r "$membership" || return 1
  if as_service test -w "$membership"; then return 1; fi
  for module in "${modules[@]}"; do
    while IFS= read -r -d '' dir; do
      as_service test -x "src/api/$dir" || return 1
      as_service test -r "src/api/$dir" || return 1
      if as_service test -w "src/api/$dir"; then return 1; fi
    done < <(cd "$source_root" && find "$module" -type d -print0)
    while IFS= read -r -d '' file; do
      as_service test -r "src/api/$file" || return 1
      if as_service test -w "src/api/$file"; then return 1; fi
    done < <(cd "$source_root" && find "$module" -type f -print0)
  done
}

check_live() {
  "$node" "$scripts/check-strapi-production.cjs"
}

db="$scripts/strapi-deploy-db.py"
# Avoid a restart on frontend-only releases. An unhealthy route still fails the deployment.
if [[ -z "$bank_import" ]] && "$node" "$scripts/prepare-member-schema.cjs" "$membership" && verify_permissions; then
  unchanged=1
  for module in "${modules[@]}"; do
    diff -qr -x '*.bak' "$source_root/$module" "src/api/$module" >/dev/null || unchanged=0
  done
  if [[ "$unchanged" == 1 ]]; then
    check_live
    python3 "$db" verify-live .tmp/data.db .tmp/data.db
    echo 'RHP_STRAPI_UNCHANGED'
    exit 0
  fi
fi

mkdir -p "$HOME/rhp-finance-backups"
backup=$(mktemp -d "$HOME/rhp-finance-backups/systemd-$(date -u +%Y%m%dT%H%M%SZ).XXXXXX")
work=$(mktemp -d "$app/.tmp/rhp-strapi-deploy.XXXXXX")
stopped=0
sources_changed=0
database_changed=0
started=0

restore_sources() {
  local module
  cp --preserve=mode,ownership,timestamps "$backup/source/$membership" "$membership" || return 1
  for module in "${modules[@]}"; do
    rsync -aA --delete "$backup/source/src/api/$module/" "src/api/$module/" || return 1
  done
}

finish() {
  local status=$?
  trap - EXIT INT TERM HUP
  set +e
  if (( status != 0 && stopped )); then
    echo "Strapi deployment failed. Backups retained at $backup" >&2
    if sudo -n systemctl stop "$unit" &&
      { (( ! sources_changed )) || restore_sources; } &&
      { (( ! database_changed || started )) || python3 "$db" restore "$backup/data.db" .tmp/data.db; } &&
      sudo -n systemctl start "$unit" && check_live; then
      echo 'Previous Strapi source restored and routes verified' >&2
    else
      echo 'Automatic Strapi recovery failed; inspect the service and retained backups' >&2
    fi
    if (( started )); then
      echo 'The live database was retained because the service had begun accepting requests' >&2
    fi
  fi
  rm -rf -- "$work"
  exit "$status"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

stopped=1
sudo -n systemctl stop "$unit"
mkdir -p "$backup/source/src/api"
cp -a --parents "$membership" "$backup/source/"
for module in "${modules[@]}"; do
  rsync -aA "src/api/$module/" "$backup/source/src/api/$module/"
done
python3 "$db" backup .tmp/data.db "$backup/data.db"
python3 "$db" verify "$backup/data.db" "$backup/data.db"

sources_changed=1
"$node" "$scripts/prepare-member-schema.cjs" "$membership" --write
chmod go-w "$membership"
setfacl -m "u:$service_user:r--" "$membership"
for module in "${modules[@]}"; do
  rsync -r --perms --chmod=D700,F600 --delete --exclude='*.bak' "$source_root/$module/" "src/api/$module/"
  find "src/api/$module" -type d -exec setfacl -m "u:$service_user:rx" {} +
  find "src/api/$module" -type f ! -name '*.bak' -exec setfacl -m "u:$service_user:r--" {} +
done
verify_permissions

mkdir "$work/db" "$work/scripts"
setfacl -m "u:$service_user:rx" "$work" "$work/scripts"
setfacl -m "u:$service_user:rwx" "$work/db"
setfacl -m "d:u:$(id -un):rwx" "$work/db"
candidate="$work/db/data.db"
python3 "$db" backup "$backup/data.db" "$candidate"
setfacl -m "u:$service_user:rw" "$candidate"
for file in initialize-member-settings.cjs import-bank-transactions.cjs match-bank-import.mjs open-strapi-deploy-db.cjs check-strapi-production.cjs; do
  install -m 600 "$scripts/$file" "$work/scripts/$file"
  setfacl -m "u:$service_user:r--" "$work/scripts/$file"
done

run_candidate() {
  sudo -n systemd-run --quiet --wait --pipe --collect --uid="$service_user" --gid="$group" \
    --working-directory="$app" --property=NoNewPrivileges=yes --property=PrivateNetwork=yes \
    --property=ProtectSystem=strict --property="ReadWritePaths=$work/db" --property=RuntimeMaxSec=120 \
    --setenv=NODE_ENV=production --setenv=HOST=127.0.0.1 --setenv=PORT=1337 \
    --setenv=DATABASE_CLIENT=sqlite --setenv="DATABASE_FILENAME=${candidate#"$app"/}" \
    --setenv="RHP_DEPLOY_DATABASE=$candidate" "$node" "$@"
}

run_candidate "$work/scripts/initialize-member-settings.cjs" >"$backup/migration.log" 2>&1
if [[ -n "$bank_import" ]]; then
  install -m 600 "$bank_import" "$work/import.json"
  setfacl -m "u:$service_user:r--" "$work/import.json"
  run_candidate "$work/scripts/import-bank-transactions.cjs" "$work/import.json" >"$backup/import.log" 2>&1
  run_candidate "$work/scripts/import-bank-transactions.cjs" "$work/import.json" >"$backup/import-repeat.log" 2>&1
  grep -q '"bankCreated":0,"paymentsCreated":0' "$backup/import-repeat.log"
fi
run_candidate "$work/scripts/check-strapi-production.cjs" --candidate >"$backup/candidate.log" 2>&1
grep -q '^RHP_PRODUCTION_ROUTES_VERIFIED$' "$backup/candidate.log"
python3 "$db" verify "$backup/data.db" "$candidate"

database_changed=1
python3 "$db" restore "$candidate" .tmp/data.db
python3 "$db" verify "$backup/data.db" .tmp/data.db
started=1
sudo -n systemctl start "$unit"
check_live
python3 "$db" verify-live "$candidate" .tmp/data.db
echo "RHP_STRAPI_DEPLOYED backup=$backup"
