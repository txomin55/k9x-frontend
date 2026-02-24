#!/usr/bin/env bash
set -euo pipefail

mkdir -p .reports/sonar
pnpm run test:unit:coverage

pnpm run unit:coverage-merge
pnpm run unit:junit-merge
cp -r ui/app/.reports/sonar .reports/sonar/app
cp -r ui/library/.reports/sonar .reports/sonar/library
