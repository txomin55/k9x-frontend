#!/usr/bin/env bash
set -euo pipefail

# GitHub Pages project sites are served from /<repo>, not from /.
if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  repo_name="${GITHUB_REPOSITORY#*/}"
  export VITE_APP_BASE_PATH="/${repo_name}"
fi

# Build only the app package and publish the generated static output as Pages artifact.
pnpm --filter ./ui/app build
rm -rf public
mkdir -p public
cp -R ui/app/.output/public/. public/

# Shared animal SVGs are requested at runtime from /animals/*.svg.
# Copy them directly into the final Pages artifact.
mkdir -p public/animals
cp -R ui/library/src/assets/svg/animals/. public/animals/

# Precompress text assets for static hosting while keeping the original files.
find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|csv\)$' -exec gzip -f -k {} \;
