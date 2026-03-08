#!/usr/bin/env bash
set -euo pipefail

mkdir -p .reports/sonar/e2e
mkdir -p .reports/cypress
mkdir -p .reports/test/e2e/coverage
mkdir -p .reports/cypress/screenshots
mkdir -p .reports/cypress/videos

pnpm --filter ./ui/app exec cypress install
# Should be using for Cypress cloud test:e2e:real
pnpm run test:e2e:coverage

cp -r ui/app/.reports/test/e2e/coverage/* .reports/test/e2e/coverage
cp -r ui/app/.reports/cypress/* .reports/cypress
cp -r ui/app/.reports/test/e2e/sonar/. .reports/sonar/e2e/app

# Include Cypress artifacts so CI can upload them.
if [ -d ui/app/cypress/screenshots ]; then
  cp -r ui/app/cypress/screenshots/. .reports/cypress/screenshots
fi
if [ -d ui/app/cypress/videos ]; then
  cp -r ui/app/cypress/videos/. .reports/cypress/videos
fi
