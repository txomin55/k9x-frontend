#!/usr/bin/env bash
set -euo pipefail

mkdir -p .reports/sonar/unit
pnpm run test:unit:coverage

pnpm run unit:coverage-merge
pnpm run unit:junit-merge

cp -r ui/app/.reports/sonar/unit .reports/sonar/unit/app
cp -r ui/library/.reports/sonar/unit .reports/sonar/unit/library
