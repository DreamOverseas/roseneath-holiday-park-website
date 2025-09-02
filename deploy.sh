# Author: Hanny
# For React + Vite website RHP

set -Eeuo pipefail
IFS=$'\n\t'

############################################
# Override-able env vars
############################################
BRANCH="${BRANCH:-main}"
REPO_DIR="${REPO_DIR:-}"                 # path to repo, empty for this in root dir
CLEAN="${CLEAN:-0}"                      # clean untracked files? 1 : 0
LOG_DIR_NAME="${LOG_DIR_NAME:-.deploy}"

############################################
# locate repo
############################################
if [[ -z "$REPO_DIR" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
  REPO_DIR="$SCRIPT_DIR"
fi

cd "$REPO_DIR"

if [[ ! -d .git ]]; then
  echo "[ERROR] $REPO_DIR is not a git repo (missing .git)"
  exit 1
fi

############################################
# simlock
############################################
LOCK_FILE="/tmp/$(basename "$REPO_DIR")-deploy.lock"
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  echo "[WARN] Some deployment already executing, skipped."
  exit 0
fi

############################################
# logging (saved in the root dir)
############################################
LOG_DIR="$REPO_DIR/$LOG_DIR_NAME"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date '+%F_%H%M%S').log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[INFO] ======== Deploy started at $(date '+%F %T') ========"
echo "[INFO] Repo: $REPO_DIR"
echo "[INFO] Branch: $BRANCH"
echo "[INFO] Log: $LOG_FILE"

echo "[INFO] Fetching latest from origin..."
git fetch --all --tags --prune

if [[ "$CLEAN" == "1" ]]; then
  echo "[INFO] Cleaning untracked files (git clean -fdx)..."
  git clean -fdx
fi

echo "[INFO] Reset to origin/${BRANCH}..."
git reset --hard "origin/${BRANCH}"

############################################
# Install with lockfile first, if not back to package.json
############################################
if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    echo "[INFO] Installing deps via npm ci..."
    npm ci
  else
    echo "[INFO] package-lock.json not exist, roll back to npm install..."
    npm install --no-audit --no-fund
  fi

  ##########################################
  # Only when build is presented, run build
  ##########################################
  if grep -q '"build"[[:space:]]*:' package.json; then
    echo "[INFO] Building..."
    npm run build
  else
    echo "[INFO] No build script, cannot npm run it, skipped."
  fi
else
  echo "[INFO] No package.json. Skip Node steps."
fi

echo "[INFO] ======== Deployment finished at $(date '+%F %T') ========"
