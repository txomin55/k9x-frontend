#!/usr/bin/env bash
set -euo pipefail

validate_offline_manifest() {
  local manifest_path="$1"

  if [[ ! -f "$manifest_path" ]]; then
    echo "Missing offline preload manifest: $manifest_path" >&2
    exit 1
  fi

  node -e '
    const fs = require("node:fs");
    const manifestPath = process.argv[1];
    const content = fs.readFileSync(manifestPath, "utf8");
    const data = JSON.parse(content);

    if (!data || typeof data.version !== "string" || !Array.isArray(data.assets)) {
      throw new Error(`Invalid offline preload manifest shape: ${manifestPath}`);
    }
  ' "$manifest_path"
}

# GitHub Pages project sites are served from /<repo>, not from /.
if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  repo_name="${GITHUB_REPOSITORY#*/}"
  export VITE_APP_BASE_PATH="/${repo_name}"
fi

# Build only the app package and publish the generated static output as Pages artifact.
pnpm --filter ./ui/app build
validate_offline_manifest "ui/app/.output/public/offline-preload-manifest.json"
rm -rf public
mkdir -p public
cp -R ui/app/.output/public/. public/
validate_offline_manifest "public/offline-preload-manifest.json"

# Shared animal SVGs are requested at runtime from /animals/*.svg.
# Copy them directly into the final Pages artifact.
mkdir -p public/animals
cp -R ui/library/src/assets/svg/animals/. public/animals/

# Precompress text assets for static hosting while keeping the original files.
find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|csv\)$' -exec gzip -f -k {} \;
