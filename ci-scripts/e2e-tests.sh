#!/usr/bin/env bash
set -euo pipefail

mkdir -p .reports/sonar
mkdir -p .reports/cypress
mkdir -p .reports/test/e2e/coverage

pnpm --filter ./ui/app exec cypress install
# Should be using for Cypress cloud test:e2e:real
pnpm run test:e2e

cp -r ui/app/.reports/test/e2e/coverage .reports/test/e2e/coverage
cp -r ui/app/.reports/cypress .reports/cypress
cp -r ui/app/.reports/tests/e2e/sonar .reports/sonar/app
