#!/usr/bin/env bash
set -euo pipefail

pnpm run build
mv ui/app/dist public
cp public/index.html public/404.html
find public -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|csv\)$' -exec gzip -f -k {} \;
echo '////////////////////////////////////////////////////// CREATING TAG //////////////////////////////////////////////////////'
version=$(grep version package.json | sed 's/.*"version".*"\(.*\)".*/\1/' | head -1)
echo "$version"
tag_name="${version}_${CI_JOB_ID}"
echo "RELEASE_NAME=$tag_name" >> generate_executables.env
echo "GE_JOB_ID=$CI_JOB_ID" >> generate_executables.env
