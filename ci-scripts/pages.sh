#!/usr/bin/env bash
set -euo pipefail

pnpm run build
rm -rf public
mkdir -p public
cp -R ui/app/build/. public/
cp public/index.html public/404.html
find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|csv\)$' -exec gzip -f -k {} \;
