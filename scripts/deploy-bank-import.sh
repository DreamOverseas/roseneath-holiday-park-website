#!/usr/bin/env bash
set -Eeuo pipefail
stage="${1:?Usage: deploy-bank-import.sh SOURCE}"
exec bash "$(dirname "${BASH_SOURCE[0]}")/deploy-strapi-production.sh" "$stage" "$stage/import.json"
