#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "nvm no se encontró en $NVM_DIR/nvm.sh; instala nvm antes de continuar." >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$NVM_DIR/nvm.sh"

if [ ! -f ".nvmrc" ]; then
  echo "No se encontró .nvmrc; define la versión de Node para usarla con nvm." >&2
  exit 1
fi

NODE_VERSION="$(cat .nvmrc)"
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"
