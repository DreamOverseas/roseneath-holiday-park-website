#!/usr/bin/env bash
set -Eeuo pipefail

BRANCH="${BRANCH:-main}"
REPO_DIR="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
LOG_DIR_NAME="${LOG_DIR_NAME:-.deploy}"
cd "$REPO_DIR"

exec 200>"/tmp/$(basename "$REPO_DIR")-deploy.lock"
flock -w 60 200

mkdir -p "$LOG_DIR_NAME"
exec > >(tee -a "$LOG_DIR_NAME/$(date '+%F_%H%M%S').log") 2>&1
test "$(git branch --show-current)" = "$BRANCH"
git fetch origin "$BRANCH"
git merge --ff-only "origin/$BRANCH"

build_dir=$(mktemp -d "$PWD/$LOG_DIR_NAME/build.XXXXXX")
trap 'rm -rf -- "$build_dir"' EXIT
npm ci
npm run build -- --outDir "$build_dir"
test -s "$build_dir/index.html"

bash scripts/deploy-member-settings.sh "$PWD"
mkdir -p dist
rsync -r --delay-updates --delete-delay "$build_dir/" dist/
echo 'RHP_DEPLOY_COMPLETE'
