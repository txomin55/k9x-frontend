SHELL := /usr/bin/env bash
.SHELLFLAGS := -euo pipefail -c

.DEFAULT_GOAL := help

.PHONY: help pre-commit install-tools

help:
	@echo "Targets disponibles:"
	@echo "  make install-tools   # nvm use (.nvmrc) y prepara pnpm via Corepack"
	@echo "  make pre-commit      # lint + unit tests"

pre-commit:
	@./scripts/lint.sh
	@./scripts/test-unit.sh

install-tools:
	@./scripts/setup-node.sh && ./scripts/setup-pnpm.sh
