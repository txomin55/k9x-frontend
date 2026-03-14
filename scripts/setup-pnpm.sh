#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node no está en PATH; ejecuta primero ./scripts/setup-node.sh (nvm use)." >&2
  exit 1
fi

PNPM_VERSION=$(node -p "require('./package.json').packageManager.split('@')[1]")
corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate
