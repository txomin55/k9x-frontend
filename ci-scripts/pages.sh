#!/usr/bin/env bash
set -euo pipefail

pnpm run build
mv ui/app/dist public
cp public/index.html public/404.html
find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|csv\)$' -exec gzip -f -k {} \;
