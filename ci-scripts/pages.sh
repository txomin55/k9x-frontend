#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  repo_name="${GITHUB_REPOSITORY#*/}"
  export VITE_APP_BASE_PATH="/${repo_name}"
fi

pnpm run build
rm -rf public
mkdir -p public
cp -R ui/app/build/. public/
cp public/index.html public/404.html
find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|csv\)$' -exec gzip -f -k {} \;
