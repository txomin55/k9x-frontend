#!/usr/bin/env bash
set -euo pipefail

PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-ui/app/.cache/ms-playwright}"
case "$PLAYWRIGHT_BROWSERS_PATH" in
  /*) ;;
  *) PLAYWRIGHT_BROWSERS_PATH="$PWD/$PLAYWRIGHT_BROWSERS_PATH" ;;
esac
export PLAYWRIGHT_BROWSERS_PATH

mkdir -p .reports/sonar/e2e
mkdir -p .reports/test/e2e/coverage
mkdir -p .reports/test/e2e/playwright
mkdir -p "$PLAYWRIGHT_BROWSERS_PATH"

pnpm --filter ./ui/app exec playwright install --with-deps chromium
pnpm run test:e2e:coverage

# Playwright Sonar reporter writes absolute file paths; strip the repo root for Sonar.
perl -0pi -e 's{\Q'"$PWD"'/\E}{}g' ui/app/.reports/sonar/e2e/sonar.xml

cp -r ui/app/.reports/test/e2e/coverage/* .reports/test/e2e/coverage
cp -R ui/app/.reports/test/e2e/playwright/. .reports/test/e2e/playwright
cp -R ui/app/.reports/sonar/e2e/. .reports/sonar/e2e
