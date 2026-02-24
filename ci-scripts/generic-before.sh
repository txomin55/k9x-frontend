#!/usr/bin/env bash
set -euo pipefail

corepack enable
corepack prepare pnpm@10.30.0 --activate
pnpm config set store-dir .pnpm-store
pnpm install --no-frozen-lockfile
