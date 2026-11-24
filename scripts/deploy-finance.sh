#!/usr/bin/env bash
set -Eeuo pipefail
stage="${1:?Usage: deploy-finance.sh SOURCE}"
exec bash "$(dirname "${BASH_SOURCE[0]}")/deploy-strapi-production.sh" "$stage"
