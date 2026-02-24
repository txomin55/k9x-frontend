#!/usr/bin/env bash
set -euo pipefail

mkdir -p .reports/sonar
pnpm --filter ./ui/app exec cypress install
# Should be using for Cypress cloud test:e2e:real
pnpm run test:e2e

pnpm run functional:coverage
cp -r ui/app/coverage coverage
cp -r ui/app/cypress cypress
cp -r ui/app/coverage/sonar .reports/sonar/app
